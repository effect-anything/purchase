import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionAdjustmentsTotalsInclude = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  earnings: Schema.String,
  breakdown: Schema.suspend(() => Models.TransactionAdjustmentsTotalsIncludeBreakdown),
  currency_code: Schema.suspend(() => Models.CurrencyCode),
})
export type TransactionAdjustmentsTotalsInclude = typeof TransactionAdjustmentsTotalsInclude.Type
