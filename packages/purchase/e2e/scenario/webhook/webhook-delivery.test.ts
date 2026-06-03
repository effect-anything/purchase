import { describe, it } from "@effect/vitest"
import { Effect } from "effect"

import { notesProMonthlySubscription } from "../../business-fixtures.ts"

// Webhook delivery scenarios validate the integrity of the signed provider-to-app callback path.
describe("webhook delivery scenarios", () => {
  // The app should persist both the raw receipt and the normalized commercial meaning.
  // Implementation note:
  // - verify the event exists on the provider side
  // - verify local webhook receipt and commercial event rows through SqlClient
  // - use assert.webhook.receipts and assert.durable.subscriptionAcquired for subscription checkout events
  it.todo(
    `accepts real signed webhooks for ${notesProMonthlySubscription.offerId} and persists receipt plus commercial meaning`
  )

  // Duplicate deliveries must be safe for every downstream projection.
  // Implementation note:
  // - start from a real signed provider webhook captured by the broker
  // - deliver it twice to the same app target
  // - verify provider-side state stays constant
  // - verify local durable rows are not duplicated
  it.todo("drops duplicate webhook deliveries without duplicating invoices, subscriptions, grants, or credits")

  // Provider ordering is not guaranteed, so final state must converge despite disorder.
  // Implementation note:
  // - replay related signed provider events in a non-original order where provider payloads allow it
  // - assert account access remains conservative during incomplete state
  // - assert final subscription, invoice, and entitlement state converges after all events arrive
  it.todo("converges to the correct final state when related webhook events arrive out of order")

  // Failures need enough breadcrumbs to debug provider, broker, and app boundaries.
  // Implementation note:
  // - exercise signature failure, unknown runId, and projection failure diagnostics separately
  // - assert diagnostics include provider, runId, target URL, event id, and processing status
  it.todo("records enough diagnostics to debug signature, broker routing, provider payload, and projection failures")
})
