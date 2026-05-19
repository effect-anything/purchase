import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountsResourceDiscountAmount = Schema.Struct({
  amount: Schema.Number,
  discount: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Discount => Models.Discount), Schema.suspend((): typeof Models.DeletedDiscount => Models.DeletedDiscount)),
})
export type DiscountsResourceDiscountAmount = typeof DiscountsResourceDiscountAmount.Type
