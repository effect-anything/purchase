import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Item = Schema.Struct({
  adjustable_quantity: Schema.NullOr(Schema.suspend((): typeof Models.LineItemsAdjustableQuantity => Models.LineItemsAdjustableQuantity)),
  amount_discount: Schema.Number,
  amount_subtotal: Schema.Number,
  amount_tax: Schema.Number,
  amount_total: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  discounts: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.LineItemsDiscountAmount => Models.LineItemsDiscountAmount))),
  id: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("item"),
  price: Schema.NullOr(Schema.suspend((): typeof Models.Price => Models.Price)),
  quantity: Schema.NullOr(Schema.Number),
  taxes: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.LineItemsTaxAmount => Models.LineItemsTaxAmount))),
})
export type Item = typeof Item.Type
