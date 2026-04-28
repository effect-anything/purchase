import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { PaymentImpl } from "../../src/provider/impl.ts"

import { CorePayTestLayer } from "./core-test-layer.ts"
import { setupPayTables, SqlitePayHarnessLive } from "./sqlite-pay-harness.ts"

export const runCorePayEffect = <A, E, R>(effect: Effect.Effect<A, E, R>, paymentLayer: Layer.Layer<PaymentImpl>) =>
  setupPayTables.pipe(
    Effect.flatMap(() => effect),
    Effect.provide(Layer.provideMerge(CorePayTestLayer, Layer.mergeAll(paymentLayer, SqlitePayHarnessLive)))
  )
