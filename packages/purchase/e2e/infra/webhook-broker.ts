import type { Readable } from "node:stream"

import { HttpLayerRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Context, Data, Effect, Layer } from "effect"
import { spawn, type ChildProcessByStdio } from "node:child_process"
import { createServer } from "node:http"

import { formatPrepareResult, prepareProvider, type ProviderPrepareInput } from "../../src/sync/config-service.ts"
import { makeTunnelRuntime, type TunnelRuntimeConfig } from "../http-api/tunnel.ts"
import { acquireProviderE2ELock } from "./provider-lock.ts"

export interface WebhookBrokerRegistration {
  readonly provider: "paddle"
  readonly runId: string
  readonly targetUrl: string
}

export class WebhookBrokerError extends Data.TaggedError("WebhookBrokerError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

type RouteTable = Map<string, WebhookBrokerRegistration>

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

const WebhookBrokerRouter = HttpLayerRouter.serve(
  Layer.mergeAll(
    HttpLayerRouter.add("POST", "/__purchase-e2e/register", (request) =>
      Effect.gen(function* () {
        const brokerState = yield* BrokerState
        const registration = (yield* request.json) as WebhookBrokerRegistration
        brokerState.routes.set(routeKey(registration.provider, registration.runId), registration)
        return yield* jsonResponse(200, { ok: true })
      })
    ),
    HttpLayerRouter.add("GET", "/__purchase-e2e/health", () =>
      Effect.gen(function* () {
        const brokerState = yield* BrokerState

        return yield* jsonResponse(200, { ok: true, routes: brokerState.routes.size })
      })
    ),
    HttpLayerRouter.add("POST", "/api/webhooks/paddle", (request) =>
      Effect.gen(function* () {
        const body = Buffer.from(yield* request.arrayBuffer)
        const runId = readPaddleRunId(body)
        if (!runId) {
          return yield* jsonResponse(202, { accepted: false, reason: "missing_run_id" })
        }

        const brokerState = yield* BrokerState

        const registration = brokerState.routes.get(routeKey("paddle", runId))
        if (!registration) {
          return yield* jsonResponse(202, { accepted: false, reason: "unregistered_run_id", runId })
        }

        const upstream = yield* forwardWebhook(registration.targetUrl, request.headers, body)

        return yield* jsonResponse(upstream.ok ? 200 : 502, {
          accepted: upstream.ok,
          runId,
          targetStatus: upstream.status,
          targetText: upstream.text.slice(0, 500)
        })
      }).pipe(Effect.catchAll((cause) => jsonResponse(500, { error: describeCause(cause) })))
    )
  )
)

export const BrokerLive = WebhookBrokerRouter.pipe(
  Layer.provideMerge(NodeHttpServer.layer(createServer, { port: 0 })),
  Layer.provide(BrokerState.Default)
)

// NodeHttpServer.layer(createServer, { port: 0 })
// const context = Layer.buildWithScope(makeWebhookBrokerServer(routes), yield* Effect.scope)
// ayer.buildWithScope(makeWebhookBrokerServer(routes), yield* Effect.scope)

// const makeWebhookBrokerServer = (routes: RouteTable) =>
//   Layer.unwrapScoped(
//     Effect.gen(function* () {
//       const context = yield* Layer.build()
//       const server = context.pipe(Context.get(HttpServer.HttpServer))
//       return WebhookBrokerRouter(routes).pipe(
//         Layer.provide(Layer.succeed(HttpServer.HttpServer, server)),
//         Layer.provide(Layer.succeedContext(context.pipe(Context.omit(HttpServer.HttpServer)))),
//         Layer.provideMerge(Layer.succeed(HttpServer.HttpServer, server))
//       )
//     })
//   ).pipe(Layer.orDie)

const startWebhookBroker = Effect.gen(function* () {
  const server = yield* HttpServer.HttpServer
  const address = server.address

  if (address._tag === "UnixAddress") {
    return yield* new WebhookBrokerError({ message: "Webhook broker did not bind to a TCP port" })
  }

  const localBaseURL = `http://${address.hostname}:${address.port}`
  const publicEndpoint = yield* resolvePublicEndpoint(localBaseURL)
  const publicBaseURL = publicEndpoint.publicBaseURL
  const tunnel = makeTunnelRuntime({ localBaseURL, publicBaseURL })

  const process = publicEndpoint.process
  if (process) {
    yield* Effect.addFinalizer(() => stopProcess(process))
  }

  return {
    localBaseURL,
    publicBaseURL,
    tunnel
  }
})

export const run = (provider: string) =>
  Effect.scoped(
    Effect.gen(function* () {
      yield* acquireProviderE2ELock(provider + ":e2e")

      const broker = yield* startWebhookBroker
      const webhookURL = `${broker.publicBaseURL}/api/webhooks/${provider}`

      const options: ProviderPrepareInput = {
        environment: "sandbox",
        ...(broker.tunnel.checkoutURL ? { checkoutUrl: broker.tunnel.checkoutURL } : {}),
        webhookUrl: webhookURL
      }
      const prepareResult = yield* prepareProvider(options)
      const { string: providerPrepareChanges, secrets } = formatPrepareResult(
        { environment: "sandbox", showSecrets: false },
        prepareResult
      )

      console.log(providerPrepareChanges)
      yield* Effect.logInfo("Webhook secrets").pipe(Effect.annotateLogs(secrets))

      return {
        ...broker,
        webhookURL
      }
    })
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

const resolvePublicEndpoint = (localBaseURL: string) =>
  Effect.gen(function* () {
    const configuredPublicBaseURL = normalizeUrl(globalThis.process.env.PURCHASE_E2E_BROKER_PUBLIC_URL)
    if (configuredPublicBaseURL) {
      return { publicBaseURL: configuredPublicBaseURL }
    }

    const localUrl = new URL(localBaseURL)
    const child = yield* spawnNgrok({ port: localUrl.port })
    const publicBaseURL = yield* waitForNgrokPublicUrl()

    return { process: child, publicBaseURL }
  })

const spawnNgrok = (input: { readonly port: string }) =>
  Effect.try({
    try: () =>
      spawn("ngrok", ["http", input.port, "--log=stdout"], {
        env: globalThis.process.env,
        stdio: ["ignore", "pipe", "pipe"]
      }),
    catch: (cause) => new WebhookBrokerError({ message: "Failed to start ngrok for webhook broker", cause })
  })

const waitForNgrokPublicUrl = (timeoutMs = 20_000) =>
  Effect.gen(function* () {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const url = yield* fetchNgrokTunnelUrl().pipe(Effect.catchAll(() => Effect.succeed(undefined)))
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

const stopProcess = (child: ChildProcessByStdio<null, Readable, Readable>) =>
  Effect.sync(() => {
    child.kill("SIGTERM")
  }).pipe(Effect.catchAllDefect(() => Effect.void))

const jsonResponse = (status: number, body: unknown) => HttpServerResponse.json(body, { status })

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
