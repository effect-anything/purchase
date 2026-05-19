import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LineItemsDiscountAmount = Schema.Struct({
  amount: Schema.Number,
  discount: Schema.suspend((): typeof Models.Discount => Models.Discount),
})
export type LineItemsDiscountAmount = typeof LineItemsDiscountAmount.Type
