import { describe, it } from "@effect/vitest"

import { aiCredits500Pack, desktopLifetimePurchase } from "../../utils/business-fixtures.ts"

// Refund scenarios define how paid state is unwound after money moves back to the customer.
describe("refund reconciliation scenarios", () => {
  // Refunding a one-time purchase should remove or deactivate the related entitlement.
  // Implementation note:
  // - verify provider-side refund state through PaymentClient
  // - verify local invoice, grant, and entitlement rows through SqlClient
  it.todo(
    `refunds ${desktopLifetimePurchase.offerId} and removes the corresponding entitlement from the account snapshot`
  )
  // Credit-pack refunds need explicit wallet reconciliation semantics.
  // Implementation note:
  // - verify provider-side refund plus local credit_ledger effects together
  // - use expectWalletBalance and expectDurableCreditLedger for refund compensation semantics
  it.todo(
    `refunds ${aiCredits500Pack.offerId} and reconciles wallet balance or compensation entries according to product rules`
  )
  // Partial refunds are common support operations and must not corrupt downstream state.
  it.todo("handles partial refunds without corrupting invoice state, purchase grants, or downstream entitlements")
})
