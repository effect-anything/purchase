import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceSeatBasedCreate = Schema.Struct({
  amount_type: Schema.String,
  price_currency: Schema.optional(Schema.suspend((): typeof Models.PresentmentCurrency => Models.PresentmentCurrency)),
  tax_behavior: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption))),
  seat_tiers: Schema.suspend((): typeof Models.ProductPriceSeatTiersInput => Models.ProductPriceSeatTiersInput),
})
export type ProductPriceSeatBasedCreate = typeof ProductPriceSeatBasedCreate.Type
