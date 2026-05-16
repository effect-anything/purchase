import { describe, it } from "@effect/vitest"

// Provider reconciliation scenarios verify recovery from retries, restarts, and delayed delivery.
describe("provider reconciliation scenarios", () => {
  // Stored receipts should be enough to rebuild state after an app restart.
  it.todo(
    "rebuilds account state from persisted webhook receipts after the app restarts between provider delivery attempts"
  )
  // Provider retries should be harmless once a webhook has already been applied.
  it.todo("replays provider events idempotently when the same sandbox webhook is retried through the broker")
  // Delayed delivery should still converge through explicit reconciliation paths.
  it.todo("backfills local state from provider queries when webhook delivery is delayed or briefly unavailable")
  // Shared broker infrastructure must not cross wires between test runs.
  it.todo(
    "routes run-scoped webhooks through the broker without cross-test leakage when multiple app instances are active"
  )
})
