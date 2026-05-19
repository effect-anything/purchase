import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceCustomCreate = Schema.Struct({
  amount_type: Schema.String,
  price_currency: Schema.optional(Schema.suspend((): typeof Models.PresentmentCurrency => Models.PresentmentCurrency)),
  tax_behavior: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption))),
  minimum_amount: Schema.optional(Schema.Number),
  maximum_amount: Schema.optional(Schema.NullOr(Schema.Number)),
  preset_amount: Schema.optional(Schema.NullOr(Schema.Number)),
})
export type ProductPriceCustomCreate = typeof ProductPriceCustomCreate.Type
