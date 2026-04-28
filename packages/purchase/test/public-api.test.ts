import { describe, expect, it } from "@effect/vitest"

import * as Purchase from "../src/public.ts"

describe("public package api", () => {
  it("exposes the stable root entrypoint surface", () => {
    expect(Purchase.BaseSDK).toBeTypeOf("function")
    expect(Purchase.plan).toBeTypeOf("function")
    expect(Purchase.subscriptionProduct).toBeTypeOf("function")
    expect(Purchase.PayProvider.FromTags).toBeTypeOf("function")
    expect(Purchase.Paddle).toBeDefined()
    expect(Purchase.Stripe).toBeDefined()
    expect(Purchase.CustomerId).toBeDefined()
    expect(Purchase.SubscriptionNotFound).toBeDefined()
    expect(Purchase.PayStorageAdapter).toBeDefined()
  })
})
