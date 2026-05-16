import { describe, it } from "@effect/vitest"

// Refund scenarios define how paid state is unwound after money moves back to the customer.
describe("refund reconciliation scenarios", () => {
  // Refunding a one-time purchase should remove or deactivate the related entitlement.
  // Implementation note:
  // - verify provider-side refund state through PaymentClient
  // - verify local invoice, grant, and entitlement rows through SqlClient
  it.todo("refunds a one-time purchase and removes the corresponding entitlement from the account snapshot")
  // Credit-pack refunds need explicit wallet reconciliation semantics.
  // Implementation note:
  // - verify provider-side refund plus local credit_ledger effects together
  it.todo(
    "refunds a credit-pack purchase and reconciles wallet balance or compensation entries according to product rules"
  )
  // Partial refunds are common support operations and must not corrupt downstream state.
  it.todo("handles partial refunds without corrupting invoice state, purchase grants, or downstream entitlements")
})
