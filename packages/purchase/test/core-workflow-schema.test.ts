import { describe, expect, it } from "@effect/vitest"
import * as Schema from "effect/Schema"

import {
  PauseSubscriptionInput,
  PrepareCheckoutInput,
  ResumeSubscriptionInput,
  StartCheckoutInput,
  WorkflowName,
  WorkflowStage
} from "../src/core/workflow-schema.ts"

describe("core workflow schema", () => {
  it("accepts public prepare-checkout input without internal fields", () => {
    const input = Schema.decodeUnknownSync(PrepareCheckoutInput)({
      offerId: "saas:pro",
      successUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel"
    })

    expect(input.offerId).toBe("saas:pro")
  })

  it("accepts internal start-checkout input with customer and metadata", () => {
    const input = Schema.decodeUnknownSync(StartCheckoutInput)({
      customerId: "customer_123",
      offerId: "saas:pro",
      successUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
      metadata: {
        source: "unit-test"
      }
    })

    expect(input.customerId).toBe("customer_123")
    expect(input.metadata.source).toBe("unit-test")
  })

  it("preserves optional provider-mode overrides on pause and resume inputs", () => {
    const pauseInput = Schema.decodeUnknownSync(PauseSubscriptionInput)({
      customerId: "customer_123",
      agreementId: "agreement_123",
      mode: "lifecycle",
      effectiveAt: "period_end"
    })

    const resumeInput = Schema.decodeUnknownSync(ResumeSubscriptionInput)({
      customerId: "customer_123",
      agreementId: "agreement_123",
      mode: "billing_collection",
      effectiveAt: "immediately"
    })

    expect(pauseInput.mode).toBe("lifecycle")
    expect(pauseInput.effectiveAt).toBe("period_end")
    expect(resumeInput.mode).toBe("billing_collection")
    expect(resumeInput.effectiveAt).toBe("immediately")
  })

  it("keeps workflow names and stages constrained to the supported vocabulary", () => {
    expect(WorkflowName.literals).toContain("checkout.start")
    expect(WorkflowName.literals).not.toContain("unknown.workflow")
    expect(WorkflowStage.literals).toContain("call_provider")
    expect(WorkflowStage.literals).not.toContain("render_ui")
  })
})
