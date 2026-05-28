import { layer } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { expectCatalogExposesCommercialOffers } from "../../utils/assertions.ts"
import {
  aiCredits500Pack,
  desktopLifetimePurchase,
  notesProMonthlySubscription
} from "../../utils/business-fixtures.ts"
import * as Harness from "../../utils/harness.ts"
import { makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

const Live = makeScenarioRuntime()

// Catalog e2e scenarios verify how app-defined commerce maps into real provider resources.
layer(Live)("catalog provider sync scenarios", (it) => {
  // The provider catalog should expose the same stable offers that the app uses publicly.
  it.effect(
    "syncs a realistic SaaS catalog into the provider sandbox and exposes stable offer ids through the app pricing API",
    () =>
      Effect.gen(function* () {
        const catalog = yield* Harness.viewCatalog()

        expectCatalogExposesCommercialOffers(catalog, {
          offers: [
            {
              offerId: notesProMonthlySubscription.offerId,
              productId: "notes",
              type: "subscription"
            },
            {
              offerId: desktopLifetimePurchase.offerId,
              productId: "desktop_pro",
              type: "one_time"
            },
            {
              offerId: aiCredits500Pack.offerId,
              productId: "ai_credit_pack",
              type: "credits"
            }
          ]
        })
      })
  )
  // Sync must respect the boundary between sdk-owned and app-owned provider resources.
  it.todo(
    "keeps sdk-owned products and prices in sync without mutating provider resources that belong to the application team"
  )
  // Re-running sync should converge without duplicate provider artifacts.
  it.todo("survives repeated catalog sync runs with no duplicate products, prices, or provider refs")
})
