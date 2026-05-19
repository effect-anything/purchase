import { Paddle } from "@effect-x/purchase/paddle"
import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext, NodeFileSystem } from "@effect/platform-node"
import { SqlClient } from "@effect/sql"
import { Effect, String as EffectString, Layer, Logger, LogLevel } from "effect"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { PurchaseConfigLayer } from "../../src/sync/config-service.ts"
import { setupPayTables } from "../../test/support/sqlite-pay-harness.ts"
import { CommercialPlans, CommercialProducts } from "../commercial-catalog.ts"
import { BrokerLive } from "./webhook-broker.ts"

function resolveRepoPath(file: string) {
  return new URL(`../../../../${file}`, import.meta.url).pathname
}

const PaddleLive = Paddle.layer.pipe(
  Layer.provide(PlatformConfigProvider.layerDotEnvAdd(resolveRepoPath(".env.local"))),
  Layer.provide(PlatformConfigProvider.layerDotEnvAdd(resolveRepoPath(".env"))),
  Layer.provide(NodeContext.layer),
  Layer.orDie
)

const SqliteLive = SQLite.layer({
  filename: ":memory:",
  disableWAL: true,
  transformQueryNames: EffectString.camelToSnake,
  transformResultNames: EffectString.snakeToCamel
})

const DBLive = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* SqlClient.SqlClient
    yield* setupPayTables
  })
).pipe(Layer.provideMerge(SqliteLive), Layer.provide(NodeFileSystem.layer))

const PurchaseLive = PurchaseConfigLayer({
  plans: CommercialPlans,
  products: CommercialProducts
}).pipe(Layer.provide(PaddleLive), Layer.provide(DBLive))

export const Live = BrokerLive.pipe(
  Layer.provideMerge(PurchaseLive),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.orDie
)
