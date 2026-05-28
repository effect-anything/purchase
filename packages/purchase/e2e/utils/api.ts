import type { PaymentClient, PaymentProviderTag } from "@effect-x/purchase/provider"

import { PaymentHarness } from "@effect-x/purchase/harness"
import { Paddle } from "@effect-x/purchase/paddle"
import { Cookies, FetchHttpClient, HttpClient, HttpClientRequest, HttpServer } from "@effect/platform"
import { NodeContext, NodeFileSystem, NodeHttpServer } from "@effect/platform-node"
import { SqlClient } from "@effect/sql"
import { Effect, String as EffectString, Config, Layer, Logger, LogLevel, Ref, ConfigProvider } from "effect"
import { createServer } from "node:http"

import type { BrokerEndpoint } from "./types.ts"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { PurchaseConfigLayer } from "../../src/sync/config-service.ts"
import { setupPayTables } from "../../test/support/sqlite-pay-harness.ts"
import { CommercialPay, CommercialPlans, CommercialProducts } from "../commercial-catalog.ts"
import { TestConfig } from "../http-api/config.ts"
import { HttpRouterLive } from "../http-api/handler.ts"
import { SessionStore } from "../http-api/session.ts"
import { EnvLayer } from "./runtime.ts"
import { registerWebhookTarget, E2EBrokerApiClient } from "./webhook-broker.ts"

export interface HttpApiTestingOptions {
  readonly broker: BrokerEndpoint
  readonly paymentClient: {
    _tag: PaymentProviderTag
    layer: Layer.Layer<PaymentClient, any>
  }
}

const DBMemory = SQLite.layer({
  filename: ":memory:",
  disableWAL: true,
  transformQueryNames: EffectString.camelToSnake,
  transformResultNames: EffectString.snakeToCamel
})

export const ApplyMigration = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* SqlClient.SqlClient
    yield* setupPayTables
  })
).pipe(Layer.provide(NodeFileSystem.layer))

const ApplyMigrationAndSeed = ApplyMigration

const DBLive = ApplyMigrationAndSeed.pipe(Layer.provideMerge(DBMemory))

export const makeHttpApiTesting = (options: HttpApiTestingOptions) => {
  const PayLive = Layer.mergeAll(
    CommercialPay.Layer,
    PurchaseConfigLayer({
      plans: CommercialPlans,
      products: CommercialProducts
    })
  )

  return HttpRouterLive.pipe(
    Layer.provideMerge(SessionStore.Live),
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const httpServer = yield* HttpServer.HttpServer
          const addr = httpServer.address

          if (addr._tag === "UnixAddress") {
            return Layer.die("UnixAddress not supported")
          }

          const localBaseUrl = `http://${addr.hostname}:${addr.port}`
          const runId = `run_${crypto.randomUUID()}`
          const ref = yield* Ref.make(Cookies.empty)

          const client = (yield* HttpClient.HttpClient).pipe(
            HttpClient.mapRequest((request) => request.pipe(HttpClientRequest.prependUrl(localBaseUrl))),
            HttpClient.withCookiesRef(ref)
          )

          const ref2 = yield* Ref.make(Cookies.empty)
          const brokerClient = (yield* HttpClient.HttpClient).pipe(
            HttpClient.mapRequest((request) => request.pipe(HttpClientRequest.prependUrl(options.broker.localBaseURL))),
            HttpClient.withCookiesRef(ref2)
          )

          const webhookBrokerApiClient = E2EBrokerApiClient.Default.pipe(
            Layer.provide(Layer.succeed(HttpClient.HttpClient, brokerClient))
          )

          const registerTarget = yield* registerWebhookTarget({
            provider: options.paymentClient._tag,
            broker: options.broker,
            runId,
            baseURL: localBaseUrl
          }).pipe(Effect.provide(webhookBrokerApiClient))

          const testConfig = Layer.succeed(
            TestConfig,
            TestConfig.of({
              runId,
              baseURL: localBaseUrl,
              broker: options.broker
              // TODO
            })
          )
          const publicCheckoutUrl = `${registerTarget.publicBaseURL}/${options.paymentClient._tag}/checkout`

          const payLayer = PayLive.pipe(
            Layer.provideMerge(PaymentHarness.make()),
            Layer.provideMerge(options.paymentClient.layer),
            Layer.provide(testConfig),
            Layer.provide(
              Layer.unwrapEffect(
                Effect.configProviderWith((currentProvider) =>
                  Effect.succeed(
                    Layer.setConfigProvider(
                      // TODO: 更多的 provider 支持
                      ConfigProvider.fromJson({
                        PADDLE_WEBHOOK_TOKEN: registerTarget.webhookSecret,
                        PADDLE_CHECKOUT_URL: publicCheckoutUrl
                      }).pipe(ConfigProvider.orElse(() => currentProvider))
                    )
                  )
                )
              )
            )
          )

          return Layer.mergeAll(
            Layer.succeed(HttpClient.HttpClient, client),
            payLayer,
            testConfig,
            webhookBrokerApiClient
          )
        })
      ).pipe(Layer.provide(FetchHttpClient.layer))
    ),
    Layer.provideMerge(DBLive),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 0, host: "127.0.0.1" })),
    Layer.provide(EnvLayer),
    Layer.provide(NodeContext.layer),
    Layer.provide(Logger.pretty),
    Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
    Layer.orDie
  )
}
