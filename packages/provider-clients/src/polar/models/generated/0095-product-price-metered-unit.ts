import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceMeteredUnit = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  source: Schema.suspend((): typeof Models.ProductPriceSource => Models.ProductPriceSource),
  amount_type: Schema.String,
  price_currency: Schema.String,
  tax_behavior: Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption)),
  is_archived: Schema.Boolean,
  product_id: Schema.String,
  unit_amount: Schema.String,
  cap_amount: Schema.NullOr(Schema.Number),
  meter_id: Schema.String,
  meter: Schema.suspend((): typeof Models.ProductPriceMeter => Models.ProductPriceMeter),
})
export type ProductPriceMeteredUnit = typeof ProductPriceMeteredUnit.Type
