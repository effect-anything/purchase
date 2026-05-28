import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpLayerRouter,
  HttpServer,
  HttpServerResponse,
  HttpServerError,
  HttpApiError,
  HttpApiClient,
  HttpClient,
  HttpClientResponse
} from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import {
  Redacted,
  Context,
  Console,
  Data,
  Effect,
  Equivalence,
  Layer,
  Schema,
  Schedule,
  Duration,
  Config
} from "effect"
import { createServer } from "node:http"

import type { BrokerEndpoint } from "./types.ts"

import { PaymentProviderTag } from "../../src/provider/types.ts"
import {
  formatPrepareResult,
  prepare,
  type ProviderPrepareInput,
  type ProviderPrepareResult,
  type PurchaseConfigService
} from "../../src/sync/config-service.ts"
import { CloudflareTunnel } from "./cloudflare-tunnel.ts"
import { acquireProviderE2ELock } from "./provider-lock.ts"

interface WebhookBrokerRegistration {
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
  routes: Schema.Number
})

const WebhookBrokerRegisterResponse = Schema.Struct({
  provider: PaymentProviderTag,
  runId: Schema.String,
  localBaseURL: Schema.String,
  publicBaseURL: Schema.String,
  brokerWebhookUrl: Schema.String,
  targetUrl: Schema.String,
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

const CheckoutPagePath = Schema.Struct({
  provider: Schema.Literal("paddle")
})

class WebhookBrokerApiError extends Schema.TaggedError<WebhookBrokerApiError>()("WebhookBrokerApiError", {
  message: Schema.String
}) {}

export class WebhookBrokerError extends Data.TaggedError("WebhookBrokerError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export const E2EBrokerApi = HttpApi.make("purchase-e2e-broker")
  .add(
    HttpApiGroup.make("broker")
      .add(HttpApiEndpoint.get("health", "/health").addSuccess(WebhookBrokerHealthResponse))
      .add(
        HttpApiEndpoint.post("register", "/register")
          .setPayload(WebhookBrokerRegistration)
          .addSuccess(WebhookBrokerRegisterResponse)
          .addError(WebhookBrokerApiError, { status: 500 })
          .addError(HttpApiError.BadRequest)
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
  .add(
    HttpApiGroup.make("checkout").add(
      HttpApiEndpoint.get("page", "/:provider/checkout")
        .setPath(CheckoutPagePath)
        .addSuccess(Schema.String)
        .addError(WebhookBrokerApiError, { status: 500 })
        .addError(HttpApiError.BadRequest)
    )
  )

const WebhookBrokerApiClient_ = HttpApiClient.make(E2EBrokerApi, {
  transformClient: (client_) => {
    const client = HttpClient.retryTransient({
      mode: "response-only",
      schedule: Schedule.exponential(Duration.millis(500))
    })(client_)

    return client as typeof client_
  }
})

export class E2EBrokerApiClient extends Context.Tag("@effect-x/purchase/e2e/utils/e2e-broker/E2EBrokerApiClient")<
  E2EBrokerApiClient,
  Effect.Effect.Success<typeof WebhookBrokerApiClient_>
>() {
  static Default = Layer.effect(E2EBrokerApiClient, WebhookBrokerApiClient_)
}

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
      const tunnels = yield* CloudflareTunnel

      const publicBaseURL = yield* tunnels.resolveBrokerEndpoint({ localBaseURL }).pipe(
        Effect.map(({ publicBaseURL }) => publicBaseURL),
        Effect.tapErrorCause(Effect.logError),
        Effect.orDie
      )

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

      const prepare_ = Effect.fn(
        function* (input: ProviderPrepareInput) {
          // yield* acquireProviderE2ELock(`prepare:${input.environment}:${input.webhookUrl ?? "no-webhook"}`)

          const prepareResult = yield* prepare(input)

          const { string: providerPrepareChanges, secrets } = formatPrepareResult(
            { environment: input.environment, showSecrets: false },
            prepareResult
          )

          yield* Console.log(providerPrepareChanges)

          yield* Effect.logInfo("Webhook secrets").pipe(Effect.annotateLogs(secrets))

          return prepareResult
        },
        Effect.scoped,
        Effect.provide(ctx),
        Effect.orDie
      )

      const prepareCache = yield* Effect.cachedFunction(
        prepare_,
        Equivalence.make(
          (self, that) =>
            self.environment === that.environment &&
            self.webhookUrl === that.webhookUrl &&
            self.approvedCheckoutUrl === that.approvedCheckoutUrl
        )
      )

      return {
        prepare: prepareCache
      }
    })
  )
}

const BrokerHttpLive = HttpApiBuilder.group(E2EBrokerApi, "broker", (handlers) =>
  handlers
    .handle("health", () =>
      Effect.gen(function* () {
        const brokerState = yield* BrokerState

        return { routes: brokerState.routes.size }
      })
    )
    .handle("register", ({ payload }) =>
      Effect.gen(function* () {
        const brokerState = yield* BrokerState
        brokerState.routes.set(routeKey(payload.provider, payload.runId), payload)

        const brokerProvider = yield* BrokerProvider
        const serverInfo = yield* BrokerServer

        const brokerWebhookUrl = `${serverInfo.publicBaseURL}/api/webhooks/${payload.provider}`
        const approvedCheckoutUrl = serverInfo.publicBaseURL

        const prepareResult = yield* brokerProvider
          .prepare({
            environment: "sandbox",
            approvedCheckoutUrl,
            webhookUrl: brokerWebhookUrl
          })
          .pipe(
            Effect.mapError((cause) => new WebhookBrokerApiError({ message: cause.message })),
            Effect.catchAllDefect((e) => {
              console.log(e)
              return new HttpApiError.BadRequest()
            })
          )

        return {
          provider: payload.provider,
          runId: payload.runId,
          localBaseURL: serverInfo.localBaseURL,
          publicBaseURL: serverInfo.publicBaseURL,
          brokerWebhookUrl,
          targetUrl: payload.targetUrl,
          ...(prepareResult.secrets?.webhook?.current ? { webhookSecret: prepareResult.secrets.webhook.current } : {})
        }
      })
    )
)

const WebhookHttpLive = HttpApiBuilder.group(E2EBrokerApi, "webhooks", (handlers) =>
  handlers.handleRaw(
    "forward",
    Effect.fn(function* ({ path, request }) {
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
      const ok = true

      return HttpServerResponse.unsafeJson(
        {
          accepted: ok,
          runId,
          targetStatus: upstream.status,
          targetText: upstream.text.slice(0, 500)
        },
        { status: ok ? 200 : 502 }
      )
    })
  )
)

const CheckoutPageHttpLive = HttpApiBuilder.group(E2EBrokerApi, "checkout", (handlers) =>
  handlers.handleRaw(
    "page",
    Effect.fn(function* ({ path }) {
      const token = yield* Config.redacted("PADDLE_CLIENT_TOKEN").pipe(Effect.orDie)
      const environment = process.env.PADDLE_ENVIRONMENT ?? "sandbox"

      return HttpServerResponse.html(renderPaddleCheckoutPage({ environment, provider: path.provider, token }))
    })
  )
)

const CheckoutRootRoute = HttpLayerRouter.add("GET", "/", () =>
  Effect.gen(function* () {
    const token = yield* Config.redacted("PADDLE_CLIENT_TOKEN").pipe(Effect.orDie)
    const environment = process.env.PADDLE_ENVIRONMENT ?? "sandbox"

    return HttpServerResponse.html(renderPaddleCheckoutPage({ environment, provider: "paddle", token }))
  })
)

const BrokerApiLive = HttpLayerRouter.addHttpApi(E2EBrokerApi).pipe(
  Layer.provide(Layer.mergeAll(BrokerHttpLive, WebhookHttpLive, CheckoutPageHttpLive))
)

const WebhookBrokerRouter = HttpLayerRouter.serve(Layer.mergeAll(BrokerApiLive, CheckoutRootRoute), {
  disableListenLog: true
})

const BrokerTunnelConfig = Config.all({
  accountId: Config.option(Config.string("CLOUDFLARE_ACCOUNT_ID")),
  apiToken: Config.option(Config.string("CLOUDFLARE_API_TOKEN")),
  port: Config.number("DEV_TUNNEL_PORT").pipe(Config.withDefault(3333)),
  host: Config.string("DEV_TUNNEL_HOST").pipe(Config.withDefault("127.0.0.1"))
})

const HttpServerLive = NodeHttpServer.layerConfig(
  createServer,
  Config.map(BrokerTunnelConfig, (config) => ({ host: config.host, port: config.port }))
)

export const BrokerLive = WebhookBrokerRouter.pipe(
  Layer.provideMerge(
    Layer.mergeAll(HttpServerLive, BrokerState.Default, BrokerProvider.Default, CloudflareTunnel.Default)
  ),
  Layer.provideMerge(
    BrokerServer.Default.pipe(Layer.provideMerge(Layer.mergeAll(HttpServerLive, CloudflareTunnel.Default)))
  )
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
        status: response.status,
        text: await response.text()
      }
    },
    catch: (cause) => new WebhookBrokerError({ message: "Failed to forward webhook", cause })
  })

export const registerWebhookTarget = Effect.fn("registerWebhookTarget")(function* (input: {
  readonly provider: PaymentProviderTag
  readonly broker: BrokerEndpoint
  readonly runId: string
  readonly baseURL: string
}) {
  const brokerApi = yield* E2EBrokerApiClient

  return yield* brokerApi.broker.register({
    payload: {
      provider: input.provider,
      runId: input.runId,
      targetUrl: `${input.baseURL}/api/webhooks/${input.provider}`
    }
  })
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

const renderPaddleCheckoutPage = (input: {
  readonly environment: string
  readonly provider: "paddle"
  readonly token: Redacted.Redacted<string>
}) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Purchase SDK ${input.provider} Checkout</title>
    <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
  </head>
  <body>
    <main id="checkout">Loading checkout...</main>
    <script>
      const params = new URLSearchParams(window.location.search);
      const transactionId = params.get("_ptxn") || params.get("transaction_id") || params.get("txn");
      const email = params.get("email");
      const country = params.get("country") || "US";
      const postal = params.get("postal") || "10001";
      Paddle.Environment.set(${JSON.stringify(input.environment)});
      Paddle.Initialize({ token: ${JSON.stringify(Redacted.value(input.token))} });
      if (transactionId) {
        Paddle.Checkout.open({
          transactionId,
          settings: {
            displayMode: "overlay",
            variant: "one-page"
          },
          customer: {
            email,
            address: {
              countryCode: country,
              postalCode: postal
            }
          },
          address: {
            countryCode: country,
            postalCode: postal
          }
        });
      } else {
        document.getElementById("checkout").textContent = "Missing Paddle transaction id.";
      }
    </script>
  </body>
</html>`

const describeCause = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause))

const routeKey = (provider: string, runId: string) => `${provider}:${runId}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)
