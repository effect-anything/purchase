import { Cookies, FetchHttpClient, HttpClient, HttpClientRequest, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeFileSystem } from "@effect/platform-node"
import { SqlClient } from "@effect/sql"
import { Effect, String as EffectString, Layer, Ref } from "effect"
import { createServer } from "node:http"

import type { BrokerEndpoint } from "../infra/types.ts"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { PurchaseConfigLayer } from "../../src/sync/config-service.ts"
import { setupPayTables } from "../../test/support/sqlite-pay-harness.ts"
import { CommercialPay, CommercialPlans, CommercialProducts } from "../commercial-catalog.ts"
import { TestConfig } from "../http-api/config.ts"
import { HttpRouterLive } from "../http-api/handler.ts"
import { SessionStore } from "../http-api/session.ts"

export interface HttpApiTestingOptions {
  readonly broker: BrokerEndpoint
  readonly checkoutURL?: string | undefined
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

export const makeHttpApiTesting = (options: HttpApiTestingOptions) => {
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
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const httpServer = yield* HttpServer.HttpServer
          const addr = httpServer.address

          if (addr._tag === "UnixAddress") {
            return Layer.die("UnixAddress not supported")
          }

          const localBaseUrl = `http://${addr.hostname}:${addr.port}`
          // const tunnel = yield* TunnelRuntime
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
                runId: `run_${crypto.randomUUID()}`,
                baseURL: localBaseUrl,
                broker: options.broker
                // ...(tunnel.checkoutURL ? { checkoutURL: tunnel.checkoutURL } : {}),
                // webhookURL: tunnel.webhookURL,
                // ...(options.broker ? { brokerBaseURL: options.broker.localBaseURL } : {}),
              })
            )
          )
        })
      ).pipe(Layer.provide(FetchHttpClient.layer))
    ),
    Layer.provideMerge(PayLive),
    // TODO: provider payment client,
    Layer.provideMerge(Layer.mergeAll(DBMemory)),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 0 })),
    Layer.orDie
  )
}
