import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjusted = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  chargeback_fee: Schema.suspend(
    (): Schema.Schema<Models.TransactionPayoutTotalsAdjustedChargebackFee> =>
      Models.TransactionPayoutTotalsAdjustedChargebackFee
  ),
  earnings: Schema.String,
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCodePayout> => Models.CurrencyCodePayout),
  exchange_rate: Schema.suspend((): Schema.Schema<Models.CurrencyExchangeRate> => Models.CurrencyExchangeRate)
})
export type TransactionPayoutTotalsAdjusted = typeof TransactionPayoutTotalsAdjusted.Type
