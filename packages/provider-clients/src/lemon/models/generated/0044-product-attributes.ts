import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductAttributes = Schema.Struct({
  store_id: Schema.Number,
  name: Schema.String,
  slug: Schema.String,
  description: Schema.optional(Schema.String),
  status: Schema.suspend((): Schema.Schema<Models.ProductStatus> => Models.ProductStatus),
  status_formatted: Schema.optional(Schema.String),
  thumb_url: Schema.optional(Schema.NullOr(Schema.String)),
  large_thumb_url: Schema.optional(Schema.NullOr(Schema.String)),
  price: Schema.Number,
  price_formatted: Schema.optional(Schema.String),
  from_price: Schema.optional(Schema.NullOr(Schema.Number)),
  from_price_formatted: Schema.optional(Schema.NullOr(Schema.String)),
  to_price: Schema.optional(Schema.NullOr(Schema.Number)),
  to_price_formatted: Schema.optional(Schema.NullOr(Schema.String)),
  pay_what_you_want: Schema.optional(Schema.Boolean),
  buy_now_url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  test_mode: Schema.Boolean
})
export type ProductAttributes = typeof ProductAttributes.Type
