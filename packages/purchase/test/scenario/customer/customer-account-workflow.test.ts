import { describe, it } from "@effect/vitest"

// Account-facing scenarios verify the business state that host applications actually consume.
describe("customer account workflow scenarios", () => {
  // The same customer should keep a stable provider identity across multiple workflows.
  // Implementation note:
  // - call checkout.start / portal.createSession / purchases.refund on the same customer
  // - verify provider-side customer identity through PaymentClient
  // - verify local provider refs through SqlClient
  // - assert provider refs are reused instead of duplicated
  // - snapshot reads should remain stable across the whole flow
  it.todo("creates and reuses the same provider customer identity across checkout, portal, refund, and sync workflows")
  // Existing provider-side customers should be linkable when local references are missing.
  // Implementation note:
  // - seed provider ref or provider lookup hit without local customer mapping
  // - trigger workflow path that calls ensureProviderCustomer
  // - verify provider customer lookup result and local provider_ref repair
  // - assert local provider refs are repaired without mutating public commercial ids
  it.todo("re-links a returning customer when the provider customer already exists and local refs are missing")
  // Real customers often hold subscriptions, one-time grants, and credit balances at the same time.
  // Implementation note:
  // - combine subscription projection, paid invoice, and credit ledger rows
  // - verify durable rows with SqlClient before checking read models
  // - assert snapshot composition first
  // - then assert entitlements composition from active offers + wallet balances
  it.todo("hydrates a unified customer snapshot when subscriptions, one-time purchases, and credit wallets coexist")
  // Cross-customer event leakage would be a critical billing isolation bug.
  // Implementation note:
  // - seed two customers with overlapping provider event shapes
  // - replay duplicate or delayed events
  // - assert only the target customer's snapshot changes
  it.todo(
    "keeps one customer's reconciliation isolated when another customer receives duplicate or delayed provider events"
  )
  // Persisted facts should be enough to restore the account view after restart.
  // Implementation note:
  // - persist checkout/webhook/commercial facts first
  // - rebuild snapshot only from stored state
  // - assert no dependency on in-memory workflow state remains
  it.todo(
    "preserves account queryability after process restart by rebuilding snapshot state from persisted commercial facts"
  )
})
