import { describe, it } from "@effect/vitest"

// Subscription webhook scenarios define how provider-side lifecycle facts become local commercial state.
describe("subscription webhook projection scenarios", () => {
  // Acquisition is complete only when the webhook creates a readable active agreement.
  // Implementation note:
  // - feed checkout_completed or subscription_updated for a subscription offer
  // - verify provider-side subscription identity and local SqlClient rows
  // - assert snapshot and entitlements, not just row existence
  it.todo("reconciles provider subscription facts into an active local agreement and paid entitlements")

  // Local projection status should represent business access semantics, not raw provider wording.
  // Implementation note:
  // - cover active, trialing, past_due->grace, paused, canceled
  // - assert which states keep access in snapshot/entitlements
  it.todo("maps provider lifecycle states into the expected local access model")

  // Default offers are part of the product policy and must be explicit in tests.
  // Implementation note:
  // - assert paid subscription replaces the default offer within its group
  // - assert default offer returns when no paid subscription in that group remains active
  it.todo("switches active offer sets between paid and default offers according to subscription coverage")

  // Webhook ordering is not guaranteed, so convergence matters more than event order.
  // Implementation note:
  // - permute checkout_completed, invoice.paid, subscription.updated
  // - keep provider-side final fact constant while varying local arrival order
  // - compare SqlClient and public read model after each ordering
  // - assert the same final snapshot and entitlements
  it.todo("converges to the same final subscription state under duplicate and out-of-order provider events")

  // Portal or provider-driven lifecycle changes still need to round-trip into the same read model.
  // Implementation note:
  // - represent pause/resume/cancel/change as webhook-driven facts
  // - assert no separate command-side shortcuts are required
  it.todo("applies provider-driven lifecycle updates through the same reconciliation path used by checkout acquisition")
})
