import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceMeteredUnitCreate = Schema.Struct({
  amount_type: Schema.String,
  price_currency: Schema.optional(Schema.suspend((): typeof Models.PresentmentCurrency => Models.PresentmentCurrency)),
  tax_behavior: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption))),
  meter_id: Schema.String,
  unit_amount: Schema.Union(Schema.Number, Schema.String),
  cap_amount: Schema.optional(Schema.NullOr(Schema.Number)),
})
export type ProductPriceMeteredUnitCreate = typeof ProductPriceMeteredUnitCreate.Type
