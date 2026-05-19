import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PricePreview = Schema.Struct({
  id: Schema.NullOr(Schema.suspend(() => Models.PriceId)),
  product_id: Schema.NullOr(Schema.suspend(() => Models.ProductId)),
  description: Schema.String,
  type: Schema.suspend(() => Models.CatalogType),
  name: Schema.NullOr(Schema.suspend(() => Models.PriceName)),
  billing_cycle: Schema.NullOr(Schema.suspend(() => Models.Duration)),
  trial_period: Schema.NullOr(Schema.suspend(() => Models.Duration)),
  tax_mode: Schema.suspend(() => Models.TaxMode),
  unit_price: Schema.suspend(() => Models.Money),
  unit_price_overrides: Schema.Array(Schema.suspend(() => Models.UnitPriceOverride)),
  quantity: Schema.suspend(() => Models.PriceQuantity),
  status: Schema.suspend(() => Models.Status),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMeta)),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
})
export type PricePreview = typeof PricePreview.Type
