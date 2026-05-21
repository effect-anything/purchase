import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CurrencyOption = Schema.Struct({
  custom_unit_amount: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomUnitAmount, any, any> =>
        Models.CustomUnitAmount as Schema.Schema<Models.CustomUnitAmount, any, any>
    )
  ),
  tax_behavior: Schema.NullOr(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tiers: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PriceTier, any, any> => Models.PriceTier as Schema.Schema<Models.PriceTier, any, any>
      )
    )
  ),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String)
})
export type CurrencyOption = typeof CurrencyOption.Type
