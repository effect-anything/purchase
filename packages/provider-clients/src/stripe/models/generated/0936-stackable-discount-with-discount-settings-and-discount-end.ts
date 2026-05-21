import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const StackableDiscountWithDiscountSettingsAndDiscountEnd = Schema.Struct({
  coupon: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Coupon, any, any> => Models.Coupon as Schema.Schema<Models.Coupon, any, any>
      )
    )
  ),
  discount: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
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
export type StackableDiscountWithDiscountSettingsAndDiscountEnd =
  typeof StackableDiscountWithDiscountSettingsAndDiscountEnd.Type
