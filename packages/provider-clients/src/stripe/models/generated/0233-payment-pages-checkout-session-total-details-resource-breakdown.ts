import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown = Schema.Struct({
  discounts: Schema.Array(Schema.suspend((): typeof Models.LineItemsDiscountAmount => Models.LineItemsDiscountAmount)),
  taxes: Schema.Array(Schema.suspend((): typeof Models.LineItemsTaxAmount => Models.LineItemsTaxAmount)),
})
export type PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown = typeof PaymentPagesCheckoutSessionTotalDetailsResourceBreakdown.Type
