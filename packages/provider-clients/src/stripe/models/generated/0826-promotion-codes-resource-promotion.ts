import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PromotionCodesResourcePromotion = Schema.Struct({
  coupon: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Coupon => Models.Coupon))),
  type: Schema.Literal("coupon"),
})
export type PromotionCodesResourcePromotion = typeof PromotionCodesResourcePromotion.Type
