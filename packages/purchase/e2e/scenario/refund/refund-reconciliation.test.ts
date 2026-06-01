import { describe, it } from "@effect/vitest"
import { Effect } from "effect"

import { aiCredits500Pack, desktopLifetimePurchase } from "../../utils/business-fixtures.ts"

// Refund scenarios define how paid state is unwound after money moves back to the customer.
describe("refund reconciliation scenarios", () => {
  // Refunding a one-time purchase should remove or deactivate the related entitlement.
  // Implementation note:
  // - start from a real completed one-time checkout and webhook-projected purchase grant
  // - verify provider-side refund state through PaymentProvider
  // - verify local invoice, grant, and entitlement rows through SqlClient
  // - verify the account snapshot no longer exposes the refunded offer as active access
  it.todo(
    `refunds ${desktopLifetimePurchase.offerId} and removes the corresponding entitlement from the account snapshot`
  )
  // Credit-pack refunds need explicit wallet reconciliation semantics.
  // Implementation note:
  // - start from a real completed credit-pack checkout and wallet projection
  // - verify provider-side refund plus local credit_ledger effects together
  // - use assert.credit.wallet and assert.credit.durableLedger for refund compensation semantics
  it.todo(
    `refunds ${aiCredits500Pack.offerId} and reconciles wallet balance or compensation entries according to product rules`
  )
  // Partial refunds are common support operations and must not corrupt downstream state.
  it.todo("handles partial refunds without corrupting invoice state, purchase grants, or downstream entitlements")
})
