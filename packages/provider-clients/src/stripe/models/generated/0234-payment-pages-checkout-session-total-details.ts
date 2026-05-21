import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionTotalDetails = Schema.Struct({
  amount_discount: Schema.Number,
  amount_shipping: Schema.NullOr(Schema.Number),
  amount_tax: Schema.Number,
  breakdown: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown, any, any> =>
        Models.PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown as Schema.Schema<
          Models.PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown,
          any,
          any
        >
    )
  )
})
export type PaymentPagesCheckoutSessionTotalDetails = typeof PaymentPagesCheckoutSessionTotalDetails.Type
