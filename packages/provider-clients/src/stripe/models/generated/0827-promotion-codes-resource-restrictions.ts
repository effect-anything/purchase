import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PromotionCodesResourceRestrictions = Schema.Struct({
  currency_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.suspend((): typeof Models.PromotionCodeCurrencyOption => Models.PromotionCodeCurrencyOption) })),
  first_time_transaction: Schema.Boolean,
  minimum_amount: Schema.NullOr(Schema.Number),
  minimum_amount_currency: Schema.NullOr(Schema.String),
})
export type PromotionCodesResourceRestrictions = typeof PromotionCodesResourceRestrictions.Type
