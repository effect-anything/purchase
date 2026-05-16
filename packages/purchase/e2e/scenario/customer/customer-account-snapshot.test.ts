import { describe, it } from "@effect/vitest"

// Customer account scenarios validate the final commercial snapshot exposed by a real app.
describe("customer account snapshot scenarios", () => {
  // The account view should converge as a customer accumulates multiple commercial artifacts.
  it.todo(
    "returns a stable account snapshot after the customer completes subscription, purchase, and credit flows over time"
  )
  // Restarts should not make already-paid business state disappear from account reads.
  it.todo("keeps account state queryable after the app process restarts and re-registers its webhook target")
  // Multi-tenant isolation is required for any production billing system.
  it.todo("shows only the current customer's subscriptions, purchases, and wallet balances in a multi-tenant test app")
})
