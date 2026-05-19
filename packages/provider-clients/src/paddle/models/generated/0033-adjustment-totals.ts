import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentTotals = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.optional(Schema.String),
  earnings: Schema.String,
  currency_code: Schema.suspend(() => Models.CurrencyCode),
})
export type AdjustmentTotals = typeof AdjustmentTotals.Type
