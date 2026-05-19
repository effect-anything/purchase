import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionTotalDetails = Schema.Struct({
  amount_discount: Schema.Number,
  amount_shipping: Schema.NullOr(Schema.Number),
  amount_tax: Schema.Number,
  breakdown: Schema.optional(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown => Models.PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown)),
})
export type PaymentPagesCheckoutSessionTotalDetails = typeof PaymentPagesCheckoutSessionTotalDetails.Type
