import { layer } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { expectCustomerSnapshotIsolated } from "../../utils/assertions.ts"
import {
  aiCredits500Pack,
  desktopLifetimePurchase,
  notesProMonthlySubscription
} from "../../utils/business-fixtures.ts"
import * as Harness from "../../utils/harness.ts"
import { makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

const Live = makeScenarioRuntime()

// Customer account scenarios validate the final commercial snapshot exposed by a real app.
layer(Live)("customer account snapshot scenarios", (it) => {
  // The account view should converge as a customer accumulates multiple commercial artifacts.
  it.todo(
    `returns a stable account snapshot after ${notesProMonthlySubscription.offerId}, ${desktopLifetimePurchase.offerId}, and ${aiCredits500Pack.offerId}`
  )
  // Restarts should not make already-paid business state disappear from account reads.
  it.todo("keeps account state queryable after the app process restarts and re-registers its webhook target")
  // Multi-tenant isolation is required for any production billing system.
  // Implementation note:
  // - use expectCustomerSnapshotIsolated to assert one customer's paid state never leaks to another account.
  it.effect("shows only the current customer's checkout activity in a multi-tenant test app", () =>
    Effect.gen(function* () {
      const owner = yield* Harness.createCustomerAccount()
      const bystander = yield* Harness.createCustomerAccount()

      yield* Harness.startSubscriptionCheckout({
        session: owner,
        offerId: notesProMonthlySubscription.offerId
      })

      const bystanderAccount = yield* Harness.viewAccount(bystander)
      expectCustomerSnapshotIsolated(bystanderAccount, {
        customerEmail: bystander.email,
        forbiddenOfferIds: [notesProMonthlySubscription.offerId]
      })
    })
  )
})
