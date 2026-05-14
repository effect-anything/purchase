import { Cookies, FetchHttpClient, HttpClient, HttpClientRequest, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeFileSystem } from "@effect/platform-node"
import { SqlClient } from "@effect/sql"
import { Effect, String as EffectString, Layer, Ref } from "effect"
import { createServer } from "node:http"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { prepareProvider, PurchaseConfigLayer } from "../../src/sync/config-service.ts"
import { setupPayTables } from "../../test/support/sqlite-pay-harness.ts"
import { CommercialPay, CommercialPlans, CommercialProducts } from "../commercial-catalog.ts"
import { TestConfig } from "../http-api/config.ts"
import { HttpRouterLive } from "../http-api/handler.ts"
import { SessionStore } from "../http-api/session.ts"
import { TunnelRuntime } from "../http-api/tunnel.ts"

const DBMemory = SQLite.layer({
  filename: ":memory:",
  disableWAL: true,
  transformQueryNames: EffectString.camelToSnake,
  transformResultNames: EffectString.snakeToCamel
})

export const ApplyMigration = Layer.effectDiscard(
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    yield* setupPayTables
  })
).pipe(Layer.provide(NodeFileSystem.layer))

const runSeed = Effect.fn(function* () {})

const ApplyMigrationAndSeed = Layer.effectDiscard(runSeed()).pipe(Layer.provide(ApplyMigration))

const PayLive = Layer.mergeAll(
  CommercialPay.Layer,
  PurchaseConfigLayer({
    plans: CommercialPlans as never,
    products: CommercialProducts as never
  })
)

export const HttpApiTesting = HttpRouterLive.pipe(
  Layer.provide(ApplyMigrationAndSeed),
  Layer.provideMerge(SessionStore.Live),
  Layer.provideMerge(Layer.mergeAll(DBMemory)),
  Layer.provideMerge(
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const httpServer = yield* HttpServer.HttpServer
        const addr = httpServer.address

        if (addr._tag === "UnixAddress") {
          return Layer.die("UnixAddress not supported")
        }

        const localBaseUrl = `http://${addr.hostname}:${addr.port}`
        const tunnel = yield* TunnelRuntime
        const ref = yield* Ref.make(Cookies.empty)

        const client = (yield* HttpClient.HttpClient).pipe(
          HttpClient.mapRequest((request) => request.pipe(HttpClientRequest.prependUrl(localBaseUrl))),
          HttpClient.withCookiesRef(ref)
        )

        yield* prepareProvider({
          ...(tunnel.checkoutURL ? { checkoutUrl: tunnel.checkoutURL } : {}),
          webhookUrl: tunnel.webhookURL
        }).pipe(Effect.orDie)

        return Layer.mergeAll(
          Layer.succeed(HttpClient.HttpClient, client),
          Layer.succeed(
            TestConfig,
            TestConfig.of({
              baseURL: tunnel.publicBaseURL,
              localBaseURL: tunnel.localBaseURL,
              publicBaseURL: tunnel.publicBaseURL,
              ...(tunnel.checkoutURL ? { checkoutURL: tunnel.checkoutURL } : {}),
              webhookURL: tunnel.webhookURL
            })
          )
        )
      })
    ).pipe(Layer.provide(FetchHttpClient.layer))
  ),
  Layer.provideMerge(
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const httpServer = yield* HttpServer.HttpServer
        const addr = httpServer.address

        if (addr._tag === "UnixAddress") {
          return Layer.die("UnixAddress not supported")
        }

        return TunnelRuntime.layer({ localBaseURL: `http://${addr.hostname}:${addr.port}` })
      })
    )
  ),
  Layer.provideMerge(PayLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 0 })),
  Layer.provideMerge(Layer.mergeAll(DBMemory)),
  Layer.orDie
)
