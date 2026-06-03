import { Effect, Layer } from "effect"

import type { PaymentProvider } from "../../src/provider/client.ts"

import { PurchaseConfigLayer } from "../../src/catalog/config-service.ts"
import { setupPayTables, SqlitePayHarnessLive } from "./sqlite-pay-harness.ts"
import { TestPay, testPlans, testProducts } from "./test-catalog.ts"

export const runPayEffect = <A, E, R>(effect: Effect.Effect<A, E, R>, paymentLayer: Layer.Layer<PaymentProvider>) =>
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
