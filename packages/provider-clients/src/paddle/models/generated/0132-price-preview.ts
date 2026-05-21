import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PricePreview = Schema.Struct({
  id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PriceId, any, any> => Models.PriceId as Schema.Schema<Models.PriceId, any, any>
    )
  ),
  product_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ProductId, any, any> => Models.ProductId as Schema.Schema<Models.ProductId, any, any>
    )
  ),
  description: Schema.String,
  type: Schema.suspend(
    (): Schema.Schema<Models.CatalogType, any, any> => Models.CatalogType as Schema.Schema<Models.CatalogType, any, any>
  ),
  name: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PriceName, any, any> => Models.PriceName as Schema.Schema<Models.PriceName, any, any>
    )
  ),
  billing_cycle: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Duration, any, any> => Models.Duration as Schema.Schema<Models.Duration, any, any>
    )
  ),
  trial_period: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Duration, any, any> => Models.Duration as Schema.Schema<Models.Duration, any, any>
    )
  ),
  tax_mode: Schema.suspend(
    (): Schema.Schema<Models.TaxMode, any, any> => Models.TaxMode as Schema.Schema<Models.TaxMode, any, any>
  ),
  unit_price: Schema.suspend(
    (): Schema.Schema<Models.Money, any, any> => Models.Money as Schema.Schema<Models.Money, any, any>
  ),
  unit_price_overrides: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.UnitPriceOverride, any, any> =>
        Models.UnitPriceOverride as Schema.Schema<Models.UnitPriceOverride, any, any>
    )
  ),
  quantity: Schema.suspend(
    (): Schema.Schema<Models.PriceQuantity, any, any> =>
      Models.PriceQuantity as Schema.Schema<Models.PriceQuantity, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.Status, any, any> => Models.Status as Schema.Schema<Models.Status, any, any>
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMeta, any, any> => Models.ImportMeta as Schema.Schema<Models.ImportMeta, any, any>
    )
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  )
})
export type PricePreview = typeof PricePreview.Type
