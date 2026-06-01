import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { String as EffectString, Layer, Logger, LogLevel } from "effect"

import * as SQLite from "../../src/internal/node-sqlite-client.ts"
import { Paddle } from "../../src/paddle.ts"
import { PurchaseConfigLayer } from "../../src/sync/config-service.ts"
import { CommercialPlans, CommercialProducts } from "../commercial-catalog.ts"
import { BrokerLive } from "./webhook-broker.ts"

function resolveRepoPath(file: string) {
  return new URL(`../../../../${file}`, import.meta.url).pathname
}

export const EnvLayer = Layer.mergeAll(
  PlatformConfigProvider.layerDotEnv(resolveRepoPath(".env")),
  PlatformConfigProvider.layerDotEnvAdd(resolveRepoPath(".env.local"))
)

const PaddleLive = Paddle.layer.pipe(Layer.provide(EnvLayer), Layer.provide(NodeContext.layer), Layer.orDie)

const DBLive = SQLite.layer({
  filename: ":memory:",
  disableWAL: true,
  transformQueryNames: EffectString.camelToSnake,
  transformResultNames: EffectString.snakeToCamel
})

const PurchaseLive = PurchaseConfigLayer({
  plans: CommercialPlans,
  products: CommercialProducts
}).pipe(Layer.provide(PaddleLive), Layer.provide(DBLive))

export const Live = BrokerLive.pipe(
  Layer.provideMerge(PurchaseLive),
  Layer.provide(Logger.pretty),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.orDie
)
