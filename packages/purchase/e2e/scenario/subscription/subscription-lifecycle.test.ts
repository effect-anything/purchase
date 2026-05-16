import { describe, it } from "@effect/vitest"

// Subscription lifecycle scenarios cover what happens after acquisition.
describe("subscription lifecycle scenarios", () => {
  // Cancellation must follow the product's access-until-period-end rule.
  // Implementation note:
  // - assert both the provider mutation receipt and the post-webhook account state
  // - verify provider-side subscription flags through PaymentClient
  // - verify local subscription row and entitlement rows through SqlClient
  // - separate "cancel requested" from "access removed"
  it.todo(
    "cancels a subscription and keeps entitlements only until the provider-confirmed period end when product rules require it"
  )
  // Scheduled cancellation should be reversible while the subscription is still active.
  // Implementation note:
  // - start from a cancel-at-period-end subscription
  // - resume it through the public SDK flow or portal flow
  // - assert the account snapshot returns to a normal active lifecycle
  it.todo("resumes a scheduled cancellation and restores the account snapshot to a normal active lifecycle")
  // Plan changes should switch the customer from old entitlements to new entitlements.
  // Implementation note:
  // - assert both intermediate preview output and final post-reconciliation entitlements
  // - verify provider-side changed offer/item and local subscription/provider_ref rows
  // - focus on business delta, not raw provider payload
  it.todo("upgrades or downgrades between plans and switches entitlements after provider reconciliation")
  // Preview output should stay aligned with the provider-side proration behavior.
  // Implementation note:
  // - compare preview fields with the later applied change receipt where possible
  // - keep this tolerant to provider formatting differences while locking business meaning
  it.todo("surfaces preview and proration information that matches the provider-side change workflow")
  // Provider portal changes still need to converge back into local application state.
  // Implementation note:
  // - drive the mutation from the provider-hosted portal, not only from SDK command APIs
  // - assert local reconciliation catches up through webhook delivery
  it.todo("propagates portal-driven subscription updates back into the local application state")
})
