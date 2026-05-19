import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPayoutTotals = Schema.Struct({
  subtotal: Schema.String,
  discount: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  credit: Schema.String,
  credit_to_balance: Schema.String,
  balance: Schema.String,
  grand_total: Schema.String,
  grand_total_tax: Schema.String,
  fee: Schema.String,
  earnings: Schema.String,
  currency_code: Schema.suspend(() => Models.CurrencyCodePayout),
  exchange_rate: Schema.suspend(() => Models.CurrencyExchangeRate),
  fee_rate: Schema.String,
})
export type TransactionPayoutTotals = typeof TransactionPayoutTotals.Type
