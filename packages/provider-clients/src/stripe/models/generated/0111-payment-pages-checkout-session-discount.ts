import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionDiscount = Schema.Struct({
  coupon: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Coupon, any, any> => Models.Coupon as Schema.Schema<Models.Coupon, any, any>
      )
    )
  ),
  promotion_code: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PromotionCode, any, any> =>
          Models.PromotionCode as Schema.Schema<Models.PromotionCode, any, any>
      )
    )
  )
})
export type PaymentPagesCheckoutSessionDiscount = typeof PaymentPagesCheckoutSessionDiscount.Type
