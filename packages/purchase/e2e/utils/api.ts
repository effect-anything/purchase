import {
  Cookies,
  FetchHttpClient,
  HttpApiClient,
  HttpClient,
  HttpClientRequest,
  HttpServer,
  FileSystem,
  Path
} from "@effect/platform"
import { NodeHttpServer, NodeFileSystem } from "@effect/platform-node"
import { SqlClient } from "@effect/sql"
import { Effect, String as EffectString, Layer, Ref } from "effect"
import { createServer } from "node:http"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { setupPayTables } from "../../test/support/sqlite-pay-harness.ts"
import { CommercialPay } from "../commercial-catalog.ts"
import { TestConfig } from "../http-api/config.ts"
import { HttpRouterLive } from "../http-api/handler.ts"
import { AppApi } from "../http-api/http.ts"

const DBMemory = SQLite.layer({
  filename: ":memory",
  disableWAL: true,
  transformQueryNames: EffectString.camelToSnake,
  transformResultNames: EffectString.snakeToCamel
})

export const ApplyMigration = Layer.effectDiscard(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const sql = yield* SqlClient.SqlClient

    yield* setupPayTables
  })
).pipe(Layer.provide(NodeFileSystem.layer))

const runSeed = Effect.fn(function* () {})

const ApplyMigrationAndSeed = Layer.effectDiscard(runSeed()).pipe(Layer.provide(ApplyMigration))

class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  effect: HttpApiClient.make(AppApi)
}) {}

export const HttpApiTesting = HttpRouterLive.pipe(
  Layer.provide(ApplyMigrationAndSeed),
  // TODO:
  Layer.provideMerge(CommercialPay.Paddle),
  Layer.provideMerge(Layer.mergeAll(DBMemory)),
  Layer.provideMerge(ApiClient.Default),
  Layer.provideMerge(
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const httpServer = yield* HttpServer.HttpServer
        const addr = httpServer.address

        if (addr._tag === "UnixAddress") {
          return Layer.die("UnixAddress not supported")
        }

        const baseUrl = `http://${addr.hostname}:${addr.port}`
        const ref = yield* Ref.make(Cookies.empty)

        const client = (yield* HttpClient.HttpClient).pipe(
          HttpClient.mapRequest((request) => request.pipe(HttpClientRequest.prependUrl(baseUrl))),
          HttpClient.withCookiesRef(ref)
        )

        return Layer.mergeAll(
          Layer.succeed(HttpClient.HttpClient, client),
          Layer.succeed(TestConfig, TestConfig.of({ baseURL: baseUrl }))
        )
      })
    ).pipe(Layer.provide(FetchHttpClient.layer))
  ),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 0 })),
  Layer.orDie
)
