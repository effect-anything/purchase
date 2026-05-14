import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import {
  CommercialCatalog,
  CommercialEvent,
  CreditBalanceBenefit,
  CustomerCommercialSnapshot,
  FeatureFlagBenefit
} from "../../src/core/commercial-schema.ts"

describe("core commercial schema", () => {
  it.effect("decodes a commercial catalog with public-facing products and offers", () =>
    Effect.gen(function* () {
      const catalog = yield* Schema.decode(CommercialCatalog)({
        products: [
          {
            id: "saas",
            type: "subscription",
            name: "SaaS",
            provider: { stripe: "prod_123" },
            metadata: {},
            offers: [
              {
                id: "saas:pro",
                productId: "saas",
                sourcePlanId: "pro",
                group: "main",
                name: "Pro",
                type: "subscription",
                billingInterval: "month",
                priceAmount: 20,
                currency: "usd",
                isDefault: false,
                provider: { stripe: "price_123" },
                benefits: [
                  {
                    id: "saas:pro:premium_access",
                    type: "feature_flag",
                    key: "premium_access",
                    enabled: true
                  }
                ],
                metadata: {}
              }
            ]
          }
        ]
      })

      expect(catalog.products[0]?.offers[0]?.id).toBe("saas:pro")
    })
  )

  it("constructs benefits with distinct commercial types", () => {
    const feature = FeatureFlagBenefit.make({
      id: "saas:pro:premium_access" as never,
      type: "feature_flag",
      key: "premium_access",
      enabled: true
    })
    const credits = CreditBalanceBenefit.make({
      id: "wallet:ai_credits" as never,
      type: "credit_balance",
      key: "ai_credits",
      unit: "AI credits",
      amount: 100
    })

    expect(feature.type).toBe("feature_flag")
    expect(credits.type).toBe("credit_balance")
  })

  it.effect("decodes commercial events and snapshots used by projections", () =>
    Effect.gen(function* () {
      const event = yield* Schema.decode(CommercialEvent)({
        id: "stripe:evt_123",
        providerEventId: "evt_123",
        provider: "stripe",
        kind: "checkout_completed",
        occurredAt: new Date("2025-01-01T00:00:00.000Z").toISOString(),
        customerId: "customer_123",
        offerId: "saas:pro",
        payload: { id: "evt_123" }
      })
      const snapshot = CustomerCommercialSnapshot.make({
        customerId: "customer_123" as never,
        subscriptions: [],
        purchases: [],
        wallets: [],
        activeOfferIds: ["saas:free"] as never,
        updatedAt: new Date("2025-01-01T00:00:00.000Z")
      })

      expect(event.kind).toBe("checkout_completed")
      expect(snapshot.activeOfferIds).toEqual(["saas:free"])
    })
  )
})
