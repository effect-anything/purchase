import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PricePreview = Schema.Struct({
  id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.PriceId> => Models.PriceId)),
  product_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ProductId> => Models.ProductId)),
  description: Schema.String,
  type: Schema.suspend((): Schema.Schema<Models.CatalogType> => Models.CatalogType),
  name: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.PriceName> => Models.PriceName)),
  billing_cycle: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration)),
  trial_period: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration)),
  tax_mode: Schema.suspend((): Schema.Schema<Models.TaxMode> => Models.TaxMode),
  unit_price: Schema.suspend((): Schema.Schema<Models.Money> => Models.Money),
  unit_price_overrides: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.UnitPriceOverride> => Models.UnitPriceOverride)
  ),
  quantity: Schema.suspend((): Schema.Schema<Models.PriceQuantity> => Models.PriceQuantity),
  status: Schema.suspend((): Schema.Schema<Models.Status> => Models.Status),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  import_meta: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ImportMeta> => Models.ImportMeta)),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt)
})
export type PricePreview = typeof PricePreview.Type
