import { describe, expect, it } from "@effect/vitest"
import * as Schema from "effect/Schema"

import {
  BillingPortalFlow,
  SubscriptionCancelTiming,
  SubscriptionChangeProrationMode,
  SubscriptionMutationMode,
  SubscriptionPreviewProrationMode
} from "../src/core/common-schema.ts"

describe("core common schema", () => {
  it("accepts valid literal values", () => {
    expect(Schema.is(BillingPortalFlow)("general")).toBe(true)
    expect(Schema.is(SubscriptionMutationMode)("billing_collection")).toBe(true)
    expect(Schema.is(SubscriptionCancelTiming)("period_end")).toBe(true)
    expect(Schema.is(SubscriptionChangeProrationMode)("provider_default")).toBe(true)
    expect(Schema.is(SubscriptionPreviewProrationMode)("none")).toBe(true)
  })

  it("rejects invalid literal values", () => {
    expect(Schema.is(BillingPortalFlow)("unsupported")).toBe(false)
    expect(Schema.is(SubscriptionMutationMode)("manual")).toBe(false)
    expect(Schema.is(SubscriptionCancelTiming)("tomorrow")).toBe(false)
    expect(Schema.is(SubscriptionChangeProrationMode)("custom")).toBe(false)
    expect(Schema.is(SubscriptionPreviewProrationMode)("provider_default")).toBe(false)
  })
})
