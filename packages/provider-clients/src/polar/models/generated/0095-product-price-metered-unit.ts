import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPriceMeteredUnit = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  source: Schema.suspend(
    (): Schema.Schema<Models.ProductPriceSource, any, any> =>
      Models.ProductPriceSource as Schema.Schema<Models.ProductPriceSource, any, any>
  ),
  amount_type: Schema.String,
  price_currency: Schema.String,
  tax_behavior: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TaxBehaviorOption, any, any> =>
        Models.TaxBehaviorOption as Schema.Schema<Models.TaxBehaviorOption, any, any>
    )
  ),
  is_archived: Schema.Boolean,
  product_id: Schema.String,
  unit_amount: Schema.String,
  cap_amount: Schema.NullOr(Schema.Number),
  meter_id: Schema.String,
  meter: Schema.suspend(
    (): Schema.Schema<Models.ProductPriceMeter, any, any> =>
      Models.ProductPriceMeter as Schema.Schema<Models.ProductPriceMeter, any, any>
  )
})
export type ProductPriceMeteredUnit = typeof ProductPriceMeteredUnit.Type
