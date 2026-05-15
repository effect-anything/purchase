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
import { makeTunnelRuntime, TunnelRuntime } from "../http-api/tunnel.ts"

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

export const makeHttpApiTesting = (provider: any) => {
  const PayLive = Layer.mergeAll(
    CommercialPay.Layer,
    PurchaseConfigLayer({
      plans: CommercialPlans,
      products: CommercialProducts
    })
  )

  return HttpRouterLive.pipe(
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

          return Layer.mergeAll(
            Layer.succeed(HttpClient.HttpClient, client),
            Layer.succeed(
              TestConfig,
              TestConfig.of({
                baseURL: localBaseUrl,
                localBaseURL: tunnel.localBaseURL,
                publicBaseURL: tunnel.publicBaseURL,
                ...(tunnel.checkoutURL ? { checkoutURL: tunnel.checkoutURL } : {}),
                webhookURL: tunnel.webhookURL,
                ...(process.env.PURCHASE_E2E_BROKER_URL ? { brokerBaseURL: process.env.PURCHASE_E2E_BROKER_URL } : {}),
                runId: `run_${crypto.randomUUID()}`
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

          const brokerBaseURL = process.env.PURCHASE_E2E_BROKER_URL
          const brokerPublicBaseURL = process.env.PURCHASE_E2E_BROKER_PUBLIC_URL
          if (brokerBaseURL && brokerPublicBaseURL) {
            return Layer.succeed(
              TunnelRuntime,
              makeTunnelRuntime({
                localBaseURL: `http://${addr.hostname}:${addr.port}`,
                publicBaseURL: brokerPublicBaseURL
              })
            )
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
}
