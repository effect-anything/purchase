import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountsResourceDiscountAmount = Schema.Struct({
  amount: Schema.Number,
  discount: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedDiscount, any, any> =>
        Models.DeletedDiscount as Schema.Schema<Models.DeletedDiscount, any, any>
    )
  )
})
export type DiscountsResourceDiscountAmount = typeof DiscountsResourceDiscountAmount.Type
