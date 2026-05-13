import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { PaymentClient } from "../../src/provider/client.ts"

import { PurchaseConfigLayer } from "../../src/config.ts"
import { setupPayTables, SqlitePayHarnessLive } from "./sqlite-pay-harness.ts"
import { TestPay, testPlans, testProducts } from "./test-catalog.ts"

export const runPayEffect = <A, E, R>(effect: Effect.Effect<A, E, R>, paymentLayer: Layer.Layer<PaymentClient>) =>
  setupPayTables.pipe(
    Effect.flatMap(() => effect),
    Effect.provide(
      Layer.provideMerge(
        Layer.mergeAll(
          TestPay.TestLayer,
          PurchaseConfigLayer({
            plans: testPlans as never,
            products: testProducts as never
          })
        ),
        Layer.mergeAll(paymentLayer, SqlitePayHarnessLive)
      )
    )
  )
