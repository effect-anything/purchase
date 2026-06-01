import { describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { assert } from "../../utils/assertions.ts"
import {
  aiCredits500Pack,
  desktopLifetimePurchase,
  notesProMonthlySubscription
} from "../../utils/business-fixtures.ts"
import * as Harness from "../../utils/harness.ts"
import { filteredScenarioPaymentProviders, makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

describe.each(filteredScenarioPaymentProviders)(
  "%s catalog provider sync scenarios",
  (_providerName, paymentProvider) => {
    const Live = makeScenarioRuntime(paymentProvider)

    // Catalog e2e scenarios verify how app-defined commerce maps into real provider resources.
    layer(Live, { excludeTestServices: true })((it) => {
      // The provider catalog should expose the same stable offers that the app uses publicly.
      it.effect(
        "syncs a realistic SaaS catalog into the provider sandbox and exposes stable offer ids through the app pricing API",
        () =>
          Effect.gen(function* () {
            const catalog = yield* Harness.getCatalog()

            assert.catalog.exposesOffers(catalog, {
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
      // Implementation note:
      // - seed or identify a provider resource that is not owned by this SDK catalog run
      // - run catalog sync through the app HTTP/API path, not direct provider setup code
      // - verify only sdk-owned provider refs and provider catalog objects change
      it.todo(
        "keeps sdk-owned products and prices in sync without mutating provider resources that belong to the application team"
      )
      // Re-running sync should converge without duplicate provider artifacts.
      // Implementation note:
      // - run the same app catalog sync more than once against the provider sandbox
      // - verify provider product/price counts and local provider_ref rows remain stable
      // - assert app pricing API still exposes the same commercial offer ids
      it.todo("survives repeated catalog sync runs with no duplicate products, prices, or provider refs")
    })
  }
)
