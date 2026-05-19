import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionAdaptivePricing = Schema.Struct({
  enabled: Schema.Boolean,
})
export type PaymentPagesCheckoutSessionAdaptivePricing = typeof PaymentPagesCheckoutSessionAdaptivePricing.Type
