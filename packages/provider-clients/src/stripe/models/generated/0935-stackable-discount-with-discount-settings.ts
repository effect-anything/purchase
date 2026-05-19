import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const StackableDiscountWithDiscountSettings = Schema.Struct({
  coupon: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Coupon => Models.Coupon))),
  discount: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Discount => Models.Discount))),
  promotion_code: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PromotionCode => Models.PromotionCode))),
})
export type StackableDiscountWithDiscountSettings = typeof StackableDiscountWithDiscountSettings.Type
