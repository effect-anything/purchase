import { describe, it } from "@effect/vitest"

// Reconciliation scenarios define how the SDK converges after retries, drift, and partial failures.
describe("reconciliation workflow scenarios", () => {
  // Partial processing failures should be recoverable from provider facts.
  // Implementation note:
  // - stop after receipt/event persistence but before final entitlement replacement
  // - verify provider-side fact is still stable through PaymentClient
  // - verify partial local durable state through SqlClient
  // - rerun reconciliation entrypoint
  // - assert final snapshot equals the clean success-path snapshot
  it.todo("reconciles local state from provider facts when webhook processing previously failed midway")
  // Replay must not duplicate any durable business state.
  // Implementation note:
  // - capture row counts for webhook_event, commercial_event, subscription, invoice, credit_ledger, entitlement
  // - verify provider-side state did not change between replay attempts
  // - replay the same provider event
  // - assert row counts and snapshot stay stable
  it.todo(
    "replays persisted webhook receipts without duplicating subscriptions, grants, entitlements, or credit ledger rows"
  )
  // Catalog/provider ownership drift needs an explicit repair path for long-lived projects.
  // Implementation note:
  // - simulate manual provider setup or partial sync drift
  // - run repair path
  // - assert sdk-owned refs are restored without overwriting app-owned provider resources
  it.todo("repairs provider refs after catalog ownership drift while preserving sdk-owned versus user-owned boundaries")
  // Related provider events may arrive out of order but final entitlements must still converge.
  // Implementation note:
  // - feed checkout_completed / invoice.paid / subscription.updated / refund events in alternate orderings
  // - keep provider-side facts constant while changing local delivery order
  // - assert the same final snapshot and entitlements across permutations
  it.todo("rebuilds entitlements after out-of-order checkout, invoice, subscription, and refund events converge")
  // Existing production billing data needs a migration and bootstrap story.
  // Implementation note:
  // - start from provider refs or raw provider records with sparse local state
  // - bootstrap local subscription/invoice/customer state
  // - assert post-bootstrap workflows operate through normal public SDK APIs
  it.todo(
    "supports provider-to-local bootstrap for real projects that import existing customers, subscriptions, and invoices"
  )
})
