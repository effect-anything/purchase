import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderItemSchema = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  label: Schema.String,
  amount: Schema.Number,
  tax_amount: Schema.Number,
  proration: Schema.Boolean,
  product_price_id: Schema.NullOr(Schema.String)
})
export type OrderItemSchema = typeof OrderItemSchema.Type
