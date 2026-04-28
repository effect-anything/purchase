import { describe, expect, it } from "@effect/vitest"

import {
  explainUnsupportedPause,
  explainUnsupportedPortalFlow,
  explainUnsupportedResume,
  resolvePauseMode,
  resolveResumeMode
} from "../../src/core/provider-capability.ts"

describe("core provider capability", () => {
  it("resolves default pause and resume modes per provider", () => {
    expect(
      resolvePauseMode({
        provider: "stripe",
        request: {} as never
      })
    ).toBe("billing_collection")
    expect(
      resolvePauseMode({
        provider: "paddle",
        request: {} as never
      })
    ).toBe("lifecycle")
    expect(
      resolveResumeMode({
        provider: "stripe",
        request: {} as never
      })
    ).toBe("billing_collection")
    expect(
      resolveResumeMode({
        provider: "paddle",
        request: {} as never
      })
    ).toBe("lifecycle")
  })

  it("explains unsupported pause combinations", () => {
    expect(
      explainUnsupportedPause({
        provider: "stripe",
        request: {
          mode: "lifecycle"
        } as never
      })
    ).toContain("billing_collection")

    expect(
      explainUnsupportedPause({
        provider: "stripe",
        request: {
          effectiveAt: "period_end"
        } as never
      })
    ).toContain("period_end")

    expect(
      explainUnsupportedPause({
        provider: "paddle",
        request: {
          mode: "billing_collection"
        } as never
      })
    ).toContain("lifecycle")
  })

  it("explains unsupported resume combinations", () => {
    expect(
      explainUnsupportedResume({
        provider: "stripe",
        request: {
          mode: "billing_collection",
          effectiveAt: "later"
        } as never
      })
    ).toContain("immediate")

    expect(
      explainUnsupportedResume({
        provider: "paddle",
        request: {
          mode: "billing_collection"
        } as never
      })
    ).toContain("lifecycle")

    expect(
      explainUnsupportedResume({
        provider: "stripe",
        request: {} as never
      })
    ).toBeUndefined()
  })

  it("explains unsupported portal flows per provider", () => {
    expect(
      explainUnsupportedPortalFlow({
        provider: "stripe",
        request: {
          flow: "subscription_cancel"
        } as never,
        hasProviderSubscriptionId: false
      })
    ).toContain("requires agreementId")

    expect(
      explainUnsupportedPortalFlow({
        provider: "paddle",
        request: {
          flow: "subscription_update"
        } as never,
        hasProviderSubscriptionId: true
      })
    ).toContain("does not support portal flow")

    expect(
      explainUnsupportedPortalFlow({
        provider: "paddle",
        request: {
          flow: "general"
        } as never,
        hasProviderSubscriptionId: false
      })
    ).toBeUndefined()
  })
})
