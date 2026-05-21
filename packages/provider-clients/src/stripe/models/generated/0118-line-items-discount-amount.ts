import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LineItemsDiscountAmount = Schema.Struct({
  amount: Schema.Number,
  discount: Schema.suspend(
    (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
  )
})
export type LineItemsDiscountAmount = typeof LineItemsDiscountAmount.Type
