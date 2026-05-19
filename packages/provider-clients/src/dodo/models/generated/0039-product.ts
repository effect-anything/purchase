import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Product = Schema.Struct({
  product_id: Schema.String,
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.suspend(() => Models.Metadata)),
  created_at: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String),
})
export type Product = typeof Product.Type
