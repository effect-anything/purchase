import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceFixed = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  source: Schema.suspend((): typeof Models.ProductPriceSource => Models.ProductPriceSource),
  amount_type: Schema.String,
  price_currency: Schema.String,
  tax_behavior: Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption)),
  is_archived: Schema.Boolean,
  product_id: Schema.String,
  price_amount: Schema.Number,
})
export type ProductPriceFixed = typeof ProductPriceFixed.Type
