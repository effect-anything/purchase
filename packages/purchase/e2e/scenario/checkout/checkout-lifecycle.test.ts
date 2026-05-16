import { describe, it } from "@effect/vitest"

// Checkout e2e scenarios cover the path from app API to hosted provider payment entry points.
describe("checkout lifecycle scenarios", () => {
  // The app needs enough metadata to reconnect provider completion back to local state.
  it.todo(
    "creates a hosted checkout for a signed-in user and returns enough metadata to reconnect the completed payment"
  )
  // One-time purchases should become durable grants after real payment completion.
  it.todo("completes a one-time purchase checkout and exposes an active purchase grant in the account API")
  // Credit-pack purchases should land in the wallet only after reconciliation succeeds.
  it.todo("completes a credit-pack checkout and reflects the acquired balance in the wallet and entitlements endpoints")
  // Abandoned or expired checkouts must not grant any paid state.
  it.todo("marks abandoned or expired checkouts as non-active without granting subscription, purchase, or credit state")
})
