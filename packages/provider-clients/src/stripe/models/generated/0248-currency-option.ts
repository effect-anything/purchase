import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CurrencyOption = Schema.Struct({
  custom_unit_amount: Schema.NullOr(Schema.suspend((): typeof Models.CustomUnitAmount => Models.CustomUnitAmount)),
  tax_behavior: Schema.NullOr(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tiers: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.PriceTier => Models.PriceTier))),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String),
})
export type CurrencyOption = typeof CurrencyOption.Type
