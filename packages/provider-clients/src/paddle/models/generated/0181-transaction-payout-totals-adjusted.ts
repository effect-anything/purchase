import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjusted = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  chargeback_fee: Schema.suspend(() => Models.TransactionPayoutTotalsAdjustedChargebackFee),
  earnings: Schema.String,
  currency_code: Schema.suspend(() => Models.CurrencyCodePayout),
  exchange_rate: Schema.suspend(() => Models.CurrencyExchangeRate),
})
export type TransactionPayoutTotalsAdjusted = typeof TransactionPayoutTotalsAdjusted.Type
