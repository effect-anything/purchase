import { describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { aiCredits500Pack, desktopLifetimePurchase, notesProMonthlySubscription } from "../../business-fixtures.ts"
import { assert } from "../../utils/assertions.ts"
import { Harness } from "../../utils/harness.ts"
import { filteredScenarioPaymentProviders, makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

describe.each(filteredScenarioPaymentProviders)(
  "%s customer account snapshot scenarios",
  (_providerName, paymentProvider) => {
    const Live = makeScenarioRuntime(paymentProvider)

    // Customer account scenarios validate the final commercial snapshot exposed by a real app.
    layer(Live, { excludeTestServices: true })((it) => {
      // The account view should converge as a customer accumulates multiple commercial artifacts.
      // Implementation note:
      // - complete real subscription, one-time purchase, and credit-pack checkouts for the same app customer
      // - assert provider-side paid state for each checkout through PaymentProvider
      // - assert local subscription, purchase, invoice, entitlement, and credit ledger rows through SqlClient
      // - assert the app account response exposes only commercial ids and stable product state
      it.todo(
        `returns a stable account snapshot after ${notesProMonthlySubscription.offerId}, ${desktopLifetimePurchase.offerId}, and ${aiCredits500Pack.offerId}`
      )

      // Restarts should not make already-paid business state disappear from account reads.
      // Implementation note:
      // - persist a real completed checkout through webhook projection
      // - rebuild the app runtime against the same database and re-register the broker target
      // - assert snapshot, entitlements, and wallet remain queryable without replaying browser payment
      it.todo("keeps account state queryable after the app process restarts and re-registers its webhook target")

      // Multi-tenant isolation is required for any production billing system.
      // Implementation note:
      // - use assert.account.isolated to assert one customer's paid state never leaks to another account.
      it.effect(
        "shows only the current customer's checkout activity in a multi-tenant test app",
        Effect.fn(function* () {
          const harness = yield* Harness
          const owner = yield* harness.createCustomerAccount()
          const bystander = yield* harness.createCustomerAccount()
          yield* harness.checkout({
            session: owner,
            offerId: notesProMonthlySubscription.offerId
          })
          const bystanderAccount = yield* harness.getAccount(bystander)
          assert.account.isolated(bystanderAccount, {
            customerEmail: bystander.email,
            forbiddenOfferIds: [notesProMonthlySubscription.offerId]
          })
        })
      )
    })
  }
)
