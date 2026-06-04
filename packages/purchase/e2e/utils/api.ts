import { Cookies, FetchHttpClient, HttpClient, HttpClientRequest, HttpServer } from "@effect/platform"
import { NodeContext, NodeFileSystem, NodeHttpServer } from "@effect/platform-node"
import { SqlClient } from "@effect/sql"
import { ConfigProvider, Effect, String as EffectString, Layer, Logger, LogLevel, Ref } from "effect"
import { createServer } from "node:http"

import type { PaymentProvider, PaymentProviderTag } from "../../src/provider.ts"
import type { BrokerEndpoint } from "../internal/types.ts"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { setupPayTables } from "../../test/support/sqlite-pay-harness.ts"
import { CommercialPay } from "../commercial-catalog.ts"
import { TestConfig } from "../http-api/config.ts"
import { HttpRouterLive } from "../http-api/handler.ts"
import { EnvLayer } from "../internal/runtime.ts"
import { E2EBrokerApiClient, registerWebhookTarget } from "../internal/webhook-broker.ts"
import { Harness, type HarnessOptions } from "./harness.ts"

export interface HttpApiTestingOptions extends HarnessOptions {
  readonly broker: BrokerEndpoint
  readonly paymentProvider: {
    _tag: PaymentProviderTag
    layer: Layer.Layer<PaymentProvider, any>
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

const PayLive = Layer.mergeAll(CommercialPay.Layer)

export const makeHttpApiTesting = (options: HttpApiTestingOptions) => {
  return HttpRouterLive.pipe(
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
            provider: options.paymentProvider._tag,
            broker: options.broker,
            runId,
            baseURL: localBaseUrl
          }).pipe(Effect.provide(webhookBrokerApiClient))

          const testConfigLayer = Layer.succeed(
            TestConfig,
            TestConfig.of({
              runId,
              baseURL: localBaseUrl,
              broker: options.broker
              // TODO: 提供更多方便测试使用的信息
            })
          )
          const publicCheckoutUrl = `${registerTarget.publicBaseURL}/${options.paymentProvider._tag}/checkout`

          const payLayer = PayLive.pipe(
            Layer.provideMerge(Harness.make({ browser: options.browser, cleanup: options.cleanup })),
            Layer.provideMerge(options.paymentProvider.layer),
            Layer.provide(testConfigLayer),
            Layer.provide(
              Layer.unwrapEffect(
                Effect.configProviderWith((currentProvider) =>
                  Effect.succeed(
                    Layer.setConfigProvider(
                      // TODO: 更多的 provider 支持
                      ConfigProvider.fromJson({
                        PADDLE_ENVIRONMENT: "sandbox",
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
            testConfigLayer,
            webhookBrokerApiClient
          )
        })
      ).pipe(Layer.provide(FetchHttpClient.layer))
    ),
    Layer.provideMerge(DBLive),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 0, host: "127.0.0.1" })),
    Layer.provide(NodeContext.layer),
    Layer.provide(Logger.pretty),
    Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
    Layer.provide(EnvLayer),
    Layer.orDie
  )
}
