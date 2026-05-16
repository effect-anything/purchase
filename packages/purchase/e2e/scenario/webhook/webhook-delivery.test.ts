import { describe, it } from "@effect/vitest"

// Webhook delivery scenarios validate the integrity of the signed provider-to-app callback path.
describe("webhook delivery scenarios", () => {
  // The app should persist both the raw receipt and the normalized commercial meaning.
  // Implementation note:
  // - verify the event exists on the provider side
  // - verify local webhook receipt and commercial event rows through SqlClient
  it.todo("accepts a real signed provider webhook and persists the original receipt plus normalized commercial event")
  // Duplicate deliveries must be safe for every downstream projection.
  // Implementation note:
  // - verify provider-side state stays constant
  // - verify local durable rows are not duplicated
  it.todo("drops duplicate webhook deliveries without duplicating invoices, subscriptions, grants, or credits")
  // Provider ordering is not guaranteed, so final state must converge despite disorder.
  it.todo("converges to the correct final state when related webhook events arrive out of order")
  // Failures need enough breadcrumbs to debug provider, broker, and app boundaries.
  it.todo("records enough diagnostics to debug signature, broker routing, provider payload, and projection failures")
})
