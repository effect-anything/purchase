import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceFreeCreate = Schema.Struct({
  amount_type: Schema.String,
  price_currency: Schema.optional(Schema.suspend((): typeof Models.PresentmentCurrency => Models.PresentmentCurrency)),
  tax_behavior: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption))),
})
export type ProductPriceFreeCreate = typeof ProductPriceFreeCreate.Type
