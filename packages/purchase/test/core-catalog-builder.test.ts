import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { buildCommercialCatalog } from "../src/core/catalog-builder.ts"
import { creditPackProduct, creditUnit, featureFlag, plan, subscriptionProduct } from "../src/dsl.ts"

const premiumAccess = featureFlag({ id: "premium_access" })
const aiCredits = creditUnit({ id: "ai_credits", unit: "AI credits" })

const plans = [
  plan({
    id: "free",
    group: "main",
    default: true,
    includes: []
  }),
  plan({
    id: "pro",
    group: "main",
    name: "Pro",
    price: { amount: 20, interval: "month" },
    includes: [premiumAccess()],
    provider: {
      stripe: "price_pro"
    }
  }),
  plan({
    id: "credits_100",
    group: "credits",
    name: "Credits 100",
    price: { amount: 10, interval: "one_time" },
    includes: [aiCredits({ amount: 100 })]
  })
] as const

const products = [
  subscriptionProduct("saas", {
    name: "SaaS",
    description: "Main subscription",
    plans: [plans[0], plans[1]]
  }),
  creditPackProduct("ai_pack", {
    name: "AI Pack",
    plans: [plans[2]]
  })
] as const

describe("core catalog builder", () => {
  it.effect("builds a commercial catalog from normalized dsl inputs", () =>
    Effect.gen(function* () {
      const catalog = yield* buildCommercialCatalog({
        plans,
        products
      })

      expect(catalog.products.map((product) => product.id)).toEqual(["saas", "ai_pack"])

      const subscriptionProduct_ = catalog.products.find((product) => product.id === "saas")
      expect(subscriptionProduct_?.offers.map((offer) => offer.id)).toEqual(["saas:free", "saas:pro"])

      const proOffer = subscriptionProduct_?.offers.find((offer) => offer.id === "saas:pro")
      expect(proOffer).toMatchObject({
        billingInterval: "month",
        priceAmount: 20,
        currency: "usd",
        isDefault: false
      })
      expect(proOffer?.benefits).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "feature_flag", key: "premium_access" })])
      )

      const creditOffer = catalog.products
        .find((product) => product.id === "ai_pack")
        ?.offers.find((offer) => offer.id === "ai_pack:credits_100")
      expect(creditOffer).toMatchObject({
        billingInterval: "one_time",
        priceAmount: 10
      })
      expect(creditOffer?.benefits).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "credit_balance",
            key: "ai_credits",
            amount: 100,
            unit: "AI credits"
          })
        ])
      )
    })
  )

  it.effect("fails when offers reference missing normalized plans", () =>
    Effect.gen(function* () {
      const result = yield* Effect.flip(
        buildCommercialCatalog({
          plans: undefined,
          products: [products[0]]
        })
      )

      expect(result._tag).toBe("CommercialCatalogIssue")
      expect(result.message).toContain("Missing normalized offer or plan")
    })
  )
})
