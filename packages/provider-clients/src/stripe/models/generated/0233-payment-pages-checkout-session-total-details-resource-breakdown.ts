import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown = Schema.Struct({
  discounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.LineItemsDiscountAmount, any, any> =>
        Models.LineItemsDiscountAmount as Schema.Schema<Models.LineItemsDiscountAmount, any, any>
    )
  ),
  taxes: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.LineItemsTaxAmount, any, any> =>
        Models.LineItemsTaxAmount as Schema.Schema<Models.LineItemsTaxAmount, any, any>
    )
  )
})
export type PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown =
  typeof PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown.Type
