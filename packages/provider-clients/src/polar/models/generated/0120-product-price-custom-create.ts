import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPriceCustomCreate = Schema.Struct({
  amount_type: Schema.String,
  price_currency: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PresentmentCurrency, any, any> =>
        Models.PresentmentCurrency as Schema.Schema<Models.PresentmentCurrency, any, any>
    )
  ),
  tax_behavior: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.TaxBehaviorOption, any, any> =>
          Models.TaxBehaviorOption as Schema.Schema<Models.TaxBehaviorOption, any, any>
      )
    )
  ),
  minimum_amount: Schema.optional(Schema.Number),
  maximum_amount: Schema.optional(Schema.NullOr(Schema.Number)),
  preset_amount: Schema.optional(Schema.NullOr(Schema.Number))
})
export type ProductPriceCustomCreate = typeof ProductPriceCustomCreate.Type
