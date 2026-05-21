import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPriceFree = Schema.Struct({
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
  product_id: Schema.String
})
export type ProductPriceFree = typeof ProductPriceFree.Type
