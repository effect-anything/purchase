import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Item = Schema.Struct({
  adjustable_quantity: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.LineItemsAdjustableQuantity, any, any> =>
        Models.LineItemsAdjustableQuantity as Schema.Schema<Models.LineItemsAdjustableQuantity, any, any>
    )
  ),
  amount_discount: Schema.Number,
  amount_subtotal: Schema.Number,
  amount_tax: Schema.Number,
  amount_total: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  discounts: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.LineItemsDiscountAmount, any, any> =>
          Models.LineItemsDiscountAmount as Schema.Schema<Models.LineItemsDiscountAmount, any, any>
      )
    )
  ),
  id: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("item"),
  price: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>)
  ),
  quantity: Schema.NullOr(Schema.Number),
  taxes: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.LineItemsTaxAmount, any, any> =>
          Models.LineItemsTaxAmount as Schema.Schema<Models.LineItemsTaxAmount, any, any>
      )
    )
  )
})
export type Item = typeof Item.Type
