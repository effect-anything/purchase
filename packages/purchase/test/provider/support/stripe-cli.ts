import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { commandExistsSync, execFileText, spawnTextProcess, waitForProcessOutput } from "./command.ts"
import { type LocalWebhookServer, makeLocalWebhookServer } from "./local-webhook-server.ts"

export interface StripeCliCapture {
  readonly payload: string
  readonly signature: string
  readonly webhookSecret: string
}

const webhookSecretPattern = /whsec_[A-Za-z0-9]+/
const resolveStripeCliCommand = (env?: NodeJS.ProcessEnv | undefined) => env?.STRIPE_CLI_COMMAND ?? "stripe"

interface CapturedStripeRequest {
  readonly body: string
  readonly type: string
  readonly signature: string
}

export const stripeCliAvailable = commandExistsSync(resolveStripeCliCommand(process.env))

const parseStripeJson = <A>(text: string) => {
  const trimmed = text.trim()
  const jsonStart = trimmed.indexOf("{")

  if (jsonStart < 0) {
    throw new Error(`Unable to parse Stripe CLI JSON output:\n${text}`)
  }

  return JSON.parse(trimmed.slice(jsonStart)) as A
}

const parseStripeRequest = (request: {
  readonly body: string
  readonly headers: Record<string, string | Array<string> | undefined>
}) => {
  const parsed = JSON.parse(request.body) as { type?: string | undefined }
  const signature = Option.fromNullable(request.headers["stripe-signature"]).pipe(
    Option.flatMap((header) => (typeof header === "string" ? Option.some(header) : Option.none())),
    Option.getOrElse(() => "")
  )

  if (!signature) {
    throw new Error("Stripe CLI webhook capture did not include a stripe-signature header")
  }

  return {
    body: request.body,
    type: parsed.type ?? "unknown",
    signature
  } satisfies CapturedStripeRequest
}

const waitForStripeEvent = (server: LocalWebhookServer, eventType: string, maxAttempts = 30) =>
  Effect.gen(function* () {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const request = yield* server.waitForRequest()
      const parsed = parseStripeRequest(request)

      if (parsed.type === eventType) {
        return parsed
      }
    }

    return yield* Effect.fail(
      new Error(`Stripe CLI did not emit expected event "${eventType}" within ${maxAttempts} attempts`)
    )
  })

export const captureStripeWebhook = (options: {
  readonly event: string
  readonly path?: string | undefined
  readonly triggerArgs?: ReadonlyArray<string> | undefined
  readonly env?: NodeJS.ProcessEnv | undefined
}) =>
  Effect.gen(function* () {
    const stripeCliCommand = resolveStripeCliCommand(options.env)
    const server = yield* makeLocalWebhookServer
    const listenPath = options.path ?? "/stripe/webhook"

    const listener = yield* spawnTextProcess(
      stripeCliCommand,
      ["listen", "--forward-to", `${server.url}${listenPath}`],
      options.env
    )

    const output = yield* waitForProcessOutput(listener, (chunk) => webhookSecretPattern.test(chunk))
    const webhookSecret = output.match(webhookSecretPattern)?.[0]

    if (!webhookSecret) {
      return yield* Effect.dieMessage(`Unable to parse Stripe webhook secret from CLI output:\n${output}`)
    }

    yield* execFileText(stripeCliCommand, options.triggerArgs ?? ["trigger", options.event], options.env)

    const event = yield* waitForStripeEvent(server, options.event)

    return {
      payload: event.body,
      signature: event.signature,
      webhookSecret
    } satisfies StripeCliCapture
  })

export const captureStripeSubscriptionResumedWebhook = (options?: {
  readonly path?: string | undefined
  readonly env?: NodeJS.ProcessEnv | undefined
}) =>
  Effect.gen(function* () {
    const stripeCliCommand = resolveStripeCliCommand(options?.env)
    const pausedCapture = yield* captureStripeWebhook({
      event: "customer.subscription.paused",
      path: options?.path,
      env: options?.env
    })

    const pausedPayload = JSON.parse(pausedCapture.payload) as {
      data?: { object?: { id?: string | undefined } | undefined } | undefined
    }
    const subscriptionId = pausedPayload.data?.object?.id

    if (!subscriptionId) {
      return yield* Effect.dieMessage("Unable to resolve paused subscription id from Stripe webhook payload")
    }

    const server = yield* makeLocalWebhookServer
    const listenPath = options?.path ?? "/stripe/webhook"
    const listener = yield* spawnTextProcess(
      stripeCliCommand,
      ["listen", "--forward-to", `${server.url}${listenPath}`],
      options?.env
    )

    const output = yield* waitForProcessOutput(listener, (chunk) => webhookSecretPattern.test(chunk))
    const webhookSecret = output.match(webhookSecretPattern)?.[0]

    if (!webhookSecret) {
      return yield* Effect.dieMessage(`Unable to parse Stripe webhook secret from CLI output:\n${output}`)
    }

    const resumedSubscription = yield* execFileText(
      stripeCliCommand,
      ["subscriptions", "resume", subscriptionId, "--confirm"],
      options?.env
    ).pipe(
      Effect.map(({ stdout }) =>
        parseStripeJson<{ id: string; status?: string | undefined; latest_invoice?: string | null }>(stdout)
      )
    )

    let latestInvoiceId =
      typeof resumedSubscription.latest_invoice === "string" ? resumedSubscription.latest_invoice : undefined

    if (!latestInvoiceId) {
      latestInvoiceId = yield* execFileText(
        stripeCliCommand,
        ["subscriptions", "retrieve", subscriptionId],
        options?.env
      ).pipe(
        Effect.map(
          ({ stdout }) => parseStripeJson<{ latest_invoice?: string | null }>(stdout).latest_invoice ?? undefined
        )
      )
    }

    if (resumedSubscription.status !== "active" && latestInvoiceId) {
      yield* execFileText(
        stripeCliCommand,
        ["invoices", "mark_uncollectible", latestInvoiceId, "--confirm"],
        options?.env
      )
    }

    const resumedEvent = yield* waitForStripeEvent(server, "customer.subscription.resumed", 60)

    return {
      payload: resumedEvent.body,
      signature: resumedEvent.signature,
      webhookSecret
    } satisfies StripeCliCapture
  })
