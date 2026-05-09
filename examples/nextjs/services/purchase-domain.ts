import type { PaymentProviderTag } from "@effect-x/purchase"

// The example runtime is pinned to Paddle sandbox so it can be copied without
// accidentally implying production readiness. Switch this to "stripe" and wire
// Stripe.layerConfig(...) in context.ts for Stripe test-mode experiments.
export const purchaseEnvironment = "sandbox" as const

export const purchaseProvider: PaymentProviderTag = "paddle"
