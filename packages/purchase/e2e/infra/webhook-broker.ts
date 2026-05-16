import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpLayerRouter,
  HttpServer,
  HttpServerResponse
} from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Context, Data, Effect, Equivalence, Layer, Schema } from "effect"
import { spawn } from "node:child_process"
import { createServer } from "node:http"

import { PaymentProviderTag } from "../../src/provider/types.ts"
import {
  formatPrepareResult,
  prepareProvider,
  type ProviderPrepareInput,
  type ProviderPrepareResult,
  type PurchaseConfigService
} from "../../src/sync/config-service.ts"
import { makeTunnelRuntime } from "../http-api/tunnel.ts"
import { acquireProviderE2ELock } from "./provider-lock.ts"

export interface WebhookBrokerRegistration {
  readonly provider: "paddle" | "stripe"
  readonly runId: string
  readonly targetUrl: string
}

const WebhookBrokerRegistration = Schema.Struct({
  provider: PaymentProviderTag,
  runId: Schema.String,
  targetUrl: Schema.String
})

const WebhookBrokerHealthResponse = Schema.Struct({
  ok: Schema.Boolean,
  routes: Schema.Number
})

const WebhookBrokerRegisterResponse = Schema.Struct({
  ok: Schema.Boolean,
  provider: PaymentProviderTag,
  runId: Schema.String,
  localBaseURL: Schema.String,
  publicBaseURL: Schema.String,
  brokerWebhookUrl: Schema.String,
  targetUrl: Schema.String,
  checkoutUrl: Schema.optional(Schema.String),
  webhookSecret: Schema.optional(Schema.String)
})

const WebhookBrokerWebhookPath = Schema.Struct({
  provider: PaymentProviderTag
})

const WebhookBrokerWebhookResponse = Schema.Struct({
  accepted: Schema.Boolean,
  reason: Schema.optional(Schema.String),
  runId: Schema.optional(Schema.String),
  targetStatus: Schema.optional(Schema.Number),
  targetText: Schema.optional(Schema.String)
})

class WebhookBrokerApiError extends Schema.TaggedError<WebhookBrokerApiError>()("WebhookBrokerApiError", {
  message: Schema.String
}) {}

export class WebhookBrokerError extends Data.TaggedError("WebhookBrokerError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export const WebhookBrokerApi = HttpApi.make("purchase-e2e-webhook-broker")
  .add(
    HttpApiGroup.make("broker")
      .add(HttpApiEndpoint.get("health", "/health").addSuccess(WebhookBrokerHealthResponse))
      .add(
        HttpApiEndpoint.post("register", "/register")
          .setPayload(WebhookBrokerRegistration)
          .addSuccess(WebhookBrokerRegisterResponse)
          .addError(WebhookBrokerApiError, { status: 500 })
      )
      .prefix("/__purchase-e2e")
  )
  .add(
    HttpApiGroup.make("webhooks")
      .add(
        HttpApiEndpoint.post("forward", "/webhooks/:provider")
          .setPath(WebhookBrokerWebhookPath)
          .addSuccess(WebhookBrokerWebhookResponse, { status: 202 })
          .addError(WebhookBrokerApiError, { status: 500 })
      )
      .prefix("/api")
  )

type RouteTable = Map<string, WebhookBrokerRegistration>

export class BrokerServer extends Context.Tag("BrokerServer")<
  BrokerServer,
  {
    localBaseURL: string
    publicBaseURL: string
  }
>() {
  static Default = Layer.scoped(
    BrokerServer,
    Effect.gen(function* () {
      const server = yield* HttpServer.HttpServer
      const address = server.address

      if (address._tag === "UnixAddress") {
        return yield* new WebhookBrokerError({ message: "Webhook broker did not bind to a TCP port" })
      }

      const localBaseURL = `http://${address.hostname}:${address.port}`
      const publicEndpoint = yield* resolvePublicEndpoint(localBaseURL)
      const publicBaseURL = publicEndpoint.publicBaseURL

      return { localBaseURL, publicBaseURL }
    })
  )
}

export class BrokerState extends Context.Tag("BrokerState")<
  BrokerState,
  {
    routes: RouteTable
  }
>() {
  static Default = Layer.effect(
    BrokerState,
    Effect.gen(function* () {
      return {
        routes: new Map()
      }
    })
  )
}

export class BrokerProvider extends Context.Tag("BrokerProvider")<
  BrokerProvider,
  {
    prepare: (input: ProviderPrepareInput) => Effect.Effect<ProviderPrepareResult, WebhookBrokerError>
  }
>() {
  static Default = Layer.effect(
    BrokerProvider,
    Effect.gen(function* () {
      const ctx = yield* Effect.context<PurchaseConfigService>()

      const prepare = (input: ProviderPrepareInput) =>
        acquireProviderE2ELock(`prepare:${input.environment}:${input.webhookUrl ?? "no-webhook"}`).pipe(
          Effect.flatMap(
            Effect.fn(function* () {
              const prepareResult = yield* prepareProvider(input)

              const { string: providerPrepareChanges, secrets } = formatPrepareResult(
                { environment: input.environment, showSecrets: false },
                prepareResult
              )

              console.log(providerPrepareChanges)

              yield* Effect.logInfo("Webhook secrets").pipe(Effect.annotateLogs(secrets))

              return prepareResult
            })
          ),
          Effect.scoped,
          Effect.provide(ctx),
          Effect.orDie
        )

      const prepareCache = yield* Effect.cachedFunction(
        prepare,
        Equivalence.make(
          (self, that) =>
            self.environment === that.environment &&
            self.checkoutUrl === that.checkoutUrl &&
            self.webhookUrl === that.webhookUrl
        )
      )

      return {
        prepare: prepareCache
      }
    })
  )
}

const BrokerHttpLive = HttpApiBuilder.group(WebhookBrokerApi, "broker", (handlers) =>
  handlers
    .handle("health", () =>
      Effect.gen(function* () {
        const brokerState = yield* BrokerState

        return { ok: true, routes: brokerState.routes.size }
      })
    )
    .handle("register", ({ payload }) =>
      Effect.gen(function* () {
        const brokerState = yield* BrokerState
        brokerState.routes.set(routeKey(payload.provider, payload.runId), payload)

        const brokerProvider = yield* BrokerProvider
        const serverInfo = yield* BrokerServer
        const tunnel = makeTunnelRuntime({
          localBaseURL: serverInfo.localBaseURL,
          publicBaseURL: serverInfo.publicBaseURL
        })
        const brokerWebhookUrl = `${serverInfo.publicBaseURL}/api/webhooks/${payload.provider}`
        const prepareResult = yield* brokerProvider
          .prepare({
            environment: "sandbox",
            ...(tunnel.checkoutURL ? { checkoutUrl: tunnel.checkoutURL } : {}),
            webhookUrl: brokerWebhookUrl
          })
          .pipe(Effect.mapError((cause) => new WebhookBrokerApiError({ message: describeCause(cause) })))

        return {
          ok: true,
          provider: payload.provider,
          runId: payload.runId,
          localBaseURL: serverInfo.localBaseURL,
          publicBaseURL: serverInfo.publicBaseURL,
          brokerWebhookUrl,
          targetUrl: payload.targetUrl,
          ...(tunnel.checkoutURL ? { checkoutUrl: tunnel.checkoutURL } : {}),
          ...(prepareResult.secrets?.webhook?.current ? { webhookSecret: prepareResult.secrets.webhook.current } : {})
        }
      })
    )
)

const WebhookHttpLive = HttpApiBuilder.group(WebhookBrokerApi, "webhooks", (handlers) =>
  handlers.handleRaw("forward", ({ path, request }) =>
    Effect.gen(function* () {
      const body = yield* request.arrayBuffer.pipe(
        Effect.map((arrayBuffer) => Buffer.from(arrayBuffer)),
        Effect.mapError((cause) => new WebhookBrokerApiError({ message: describeCause(cause) }))
      )
      const runId = path.provider === "paddle" ? readPaddleRunId(body) : undefined
      if (!runId) {
        return HttpServerResponse.unsafeJson({ accepted: false, reason: "missing_run_id" }, { status: 202 })
      }

      const brokerState = yield* BrokerState

      const registration = brokerState.routes.get(routeKey(path.provider, runId))
      if (!registration) {
        return HttpServerResponse.unsafeJson({ accepted: false, reason: "unregistered_run_id", runId }, { status: 202 })
      }

      const upstream = yield* forwardWebhook(registration.targetUrl, request.headers, body).pipe(
        Effect.mapError((cause) => new WebhookBrokerApiError({ message: describeCause(cause) }))
      )

      return HttpServerResponse.unsafeJson(
        {
          accepted: upstream.ok,
          runId,
          targetStatus: upstream.status,
          targetText: upstream.text.slice(0, 500)
        },
        { status: upstream.ok ? 200 : 502 }
      )
    })
  )
)

const BrokerApiLive = HttpLayerRouter.addHttpApi(WebhookBrokerApi).pipe(
  Layer.provide(Layer.mergeAll(BrokerHttpLive, WebhookHttpLive))
)

const WebhookBrokerRouter = HttpLayerRouter.serve(BrokerApiLive)

const HttpServerLive = NodeHttpServer.layer(createServer, { port: 0 })

export const BrokerLive = WebhookBrokerRouter.pipe(
  Layer.provide([
    HttpServerLive,
    BrokerServer.Default.pipe(Layer.provide(HttpServerLive)),
    BrokerState.Default,
    BrokerProvider.Default
  ])
)

const forwardWebhook = (targetUrl: string, requestHeaders: Record<string, string>, body: Buffer) =>
  Effect.tryPromise({
    try: async () => {
      const headers = new Headers()
      for (const [key, value] of Object.entries(requestHeaders)) {
        if (key === "host" || key === "content-length") {
          continue
        }
        headers.set(key, value)
      }
      headers.set("content-length", String(body.byteLength))

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: new Uint8Array(body)
      })

      return {
        ok: response.ok,
        status: response.status,
        text: await response.text()
      }
    },
    catch: (cause) => new WebhookBrokerError({ message: "Failed to forward webhook", cause })
  })

const readPaddleRunId = (body: Buffer) => {
  try {
    const envelope = JSON.parse(body.toString("utf8")) as { readonly data?: { readonly custom_data?: unknown } }
    const customData = envelope.data?.custom_data
    return isRecord(customData) && typeof customData.purchaseE2eRunId === "string"
      ? customData.purchaseE2eRunId
      : undefined
  } catch {
    return undefined
  }
}

const resolvePublicEndpoint = Effect.fn(function* (localBaseURL: string) {
  const configuredPublicBaseURL = normalizeUrl(globalThis.process.env.PURCHASE_E2E_BROKER_PUBLIC_URL)
  if (configuredPublicBaseURL) {
    return { publicBaseURL: configuredPublicBaseURL }
  }
  const localUrl = new URL(localBaseURL)
  yield* spawnNgrok({ port: localUrl.port })
  const publicBaseURL = yield* waitForNgrokPublicUrl()
  return { publicBaseURL }
})

const spawnNgrok = (input: { readonly port: string }) =>
  Effect.acquireRelease(
    Effect.try({
      try: () =>
        spawn("ngrok", ["http", input.port, "--log=stdout"], {
          env: globalThis.process.env,
          stdio: ["ignore", "pipe", "pipe"]
        }),
      catch: (cause) => new WebhookBrokerError({ message: "Failed to start ngrok for webhook broker", cause })
    }),
    (child) =>
      Effect.sync(() => {
        child.kill("SIGTERM")
      }).pipe(Effect.catchAllDefect(() => Effect.void))
  )

const waitForNgrokPublicUrl = (timeoutMs = 20_000) =>
  Effect.gen(function* () {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const url = yield* fetchNgrokTunnelUrl().pipe(Effect.orElseSucceed(() => undefined))
      if (url) {
        return url
      }

      yield* Effect.sleep(500)
    }

    return yield* new WebhookBrokerError({
      message: `Timed out waiting for webhook broker ngrok public URL after ${timeoutMs}ms`
    })
  })

const fetchNgrokTunnelUrl = () =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch("http://127.0.0.1:4040/api/tunnels")
      const json = (await response.json()) as {
        readonly tunnels?: ReadonlyArray<{
          readonly public_url?: string
          readonly proto?: string
        }>
      }
      const tunnel = json.tunnels?.find((entry) => entry.proto === "https" && entry.public_url)
      if (!tunnel?.public_url) {
        throw new Error("ngrok has not exposed an https tunnel yet")
      }

      return tunnel.public_url
    },
    catch: (cause) => new WebhookBrokerError({ message: "Failed to read ngrok tunnel API", cause })
  })

const describeCause = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause))

const routeKey = (provider: string, runId: string) => `${provider}:${runId}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const normalizeUrl = (value: string | undefined) => {
  if (!value) {
    return undefined
  }
  return value.replace(/\/+$/, "")
}
