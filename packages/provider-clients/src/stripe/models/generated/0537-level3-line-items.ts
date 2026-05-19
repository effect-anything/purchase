import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Level3LineItems = Schema.Struct({
  discount_amount: Schema.NullOr(Schema.Number),
  product_code: Schema.String,
  product_description: Schema.String,
  quantity: Schema.NullOr(Schema.Number),
  tax_amount: Schema.NullOr(Schema.Number),
  unit_cost: Schema.NullOr(Schema.Number),
})
export type Level3LineItems = typeof Level3LineItems.Type
