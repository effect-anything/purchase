import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { PaymentImpl } from "../../src/provider/impl.ts"

import { setupPayTables, SqlitePayHarnessLive } from "./sqlite-pay-harness.ts"
import { TestPay } from "./test-catalog.ts"

export const runPayEffect = <A, E, R>(effect: Effect.Effect<A, E, R>, paymentLayer: Layer.Layer<PaymentImpl>) =>
  setupPayTables.pipe(
    Effect.flatMap(() => effect),
    Effect.provide(Layer.provideMerge(TestPay.TestLayer, Layer.mergeAll(paymentLayer, SqlitePayHarnessLive)))
  )
