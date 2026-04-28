import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { CommercialCatalogService } from "../src/core/catalog-service.ts"
import { runCorePayEffect } from "./support/run-core-pay-effect.ts"
import { queryAll } from "./support/sqlite-pay-harness.ts"
import { testOfferIds } from "./support/test-catalog.ts"
import { makeTestPaymentLayer } from "./support/test-payment-provider.ts"

describe("core catalog service", () => {
  it.effect("gets catalog entries and resolves checkout targets from unified catalog state", () => {
    const payment = makeTestPaymentLayer()

    return runCorePayEffect(
      Effect.gen(function* () {
        const service = yield* CommercialCatalogService
        yield* service.sync()

        const catalog = yield* service.getCatalog()
        const product = yield* service.getProduct({ productId: "saas" })
        const offer = yield* service.getOffer({ offerId: testOfferIds.proMonthly })
        const defaultOffer = yield* service.resolveDefaultOffer({ productId: "saas", group: "main" })
        const changeTargets = yield* service.listSubscriptionChangeTargets({ currentOfferId: testOfferIds.free })
        const target = yield* service.resolveCheckoutTarget({
          offerId: testOfferIds.proMonthly,
          provider: "stripe"
        })

        expect(catalog.products.length).toBeGreaterThan(0)
        expect(Option.getOrUndefined(product)?.id).toBe("saas")
        expect(Option.getOrUndefined(offer)?.id).toBe(testOfferIds.proMonthly)
        expect(Option.getOrUndefined(defaultOffer)?.id).toBe(testOfferIds.free)
        expect(changeTargets.map((entry) => entry.id)).toEqual([testOfferIds.proMonthly])
        expect(target.offerId).toBe(testOfferIds.proMonthly)
        expect(target.providerOfferId).toBeDefined()
      }),
      payment.layer
    )
  })

  it.effect("prefers persisted provider mappings when resolving checkout targets", () => {
    const payment = makeTestPaymentLayer()

    return runCorePayEffect(
      Effect.gen(function* () {
        const now = "2025-01-01T00:00:00.000Z"

        yield* queryAll(
          `INSERT INTO paykit_product
             (internal_id, id, version, name, "group", is_default, price_amount, price_interval, hash, provider, created_at, updated_at)
           VALUES (?, ?, 1, 'Pro Monthly', 'main', 0, 20, 'month', 'hash', ?, ?, ?)`,
          [
            "internal_pro_monthly",
            testOfferIds.proMonthly,
            JSON.stringify({
              stripe: "price_persisted",
              "stripe:product": "prod_persisted"
            }),
            now,
            now
          ]
        )

        const service = yield* CommercialCatalogService
        const target = yield* service.resolveCheckoutTarget({
          offerId: testOfferIds.proMonthly,
          provider: "stripe"
        })

        expect(target.providerProductId).toBe("prod_persisted")
        expect(target.providerOfferId).toBe("price_persisted")
      }),
      payment.layer
    )
  })
})
