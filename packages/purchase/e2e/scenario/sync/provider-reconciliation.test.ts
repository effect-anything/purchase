import { describe, it } from "@effect/vitest"
import { Effect } from "effect"

import { notesProMonthlySubscription } from "../../utils/business-fixtures.ts"

// Provider reconciliation scenarios verify recovery from retries, restarts, and delayed delivery.
describe("provider reconciliation scenarios", () => {
  // Stored receipts should be enough to rebuild state after an app restart.
  // Implementation note:
  // - complete a real checkout and persist signed webhook receipts
  // - restart or rebuild the app runtime against the same durable database
  // - replay/reconcile from persisted receipts without another browser payment
  // - assert subscription, invoice, entitlements, and account snapshot are restored
  it.todo(`rebuilds ${notesProMonthlySubscription.offerId} account state from persisted webhook receipts after restart`)
  // Provider retries should be harmless once a webhook has already been applied.
  // Implementation note:
  // - replay the same signed provider delivery through the broker or app webhook endpoint
  // - assert webhook receipt handling is idempotent and local projections are not duplicated
  // - verify provider-side state remains unchanged
  it.todo("replays provider events idempotently when the same sandbox webhook is retried through the broker")
  // Delayed delivery should still converge through explicit reconciliation paths.
  // Implementation note:
  // - complete provider payment while delaying or temporarily failing local delivery
  // - recover through provider queries, replay, or explicit reconciliation public workflow
  // - assert interim app state stays conservative and final state converges
  it.todo("backfills local state from provider queries when webhook delivery is delayed or briefly unavailable")
  // Shared broker infrastructure must not cross wires between test runs.
  // Implementation note:
  // - run two app instances with different runIds and active checkout sessions
  // - verify each signed webhook routes only to its registered local target
  // - assert one customer's durable and account state never appears in the other run
  it.todo(
    "routes run-scoped webhooks through the broker without cross-test leakage when multiple app instances are active"
  )
})
