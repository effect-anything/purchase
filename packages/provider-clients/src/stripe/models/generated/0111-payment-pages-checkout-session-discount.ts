import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionDiscount = Schema.Struct({
  coupon: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Coupon => Models.Coupon))),
  promotion_code: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PromotionCode => Models.PromotionCode))),
})
export type PaymentPagesCheckoutSessionDiscount = typeof PaymentPagesCheckoutSessionDiscount.Type
