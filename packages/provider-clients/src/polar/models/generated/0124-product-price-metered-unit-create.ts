import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPriceMeteredUnitCreate = Schema.Struct({
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
  meter_id: Schema.String,
  unit_amount: Schema.Union(Schema.Number, Schema.String),
  cap_amount: Schema.optional(Schema.NullOr(Schema.Number))
})
export type ProductPriceMeteredUnitCreate = typeof ProductPriceMeteredUnitCreate.Type
