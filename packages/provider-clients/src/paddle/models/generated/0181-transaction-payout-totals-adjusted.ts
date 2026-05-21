import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjusted = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  chargeback_fee: Schema.suspend(
    (): Schema.Schema<Models.TransactionPayoutTotalsAdjustedChargebackFee, any, any> =>
      Models.TransactionPayoutTotalsAdjustedChargebackFee as Schema.Schema<
        Models.TransactionPayoutTotalsAdjustedChargebackFee,
        any,
        any
      >
  ),
  earnings: Schema.String,
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCodePayout, any, any> =>
      Models.CurrencyCodePayout as Schema.Schema<Models.CurrencyCodePayout, any, any>
  ),
  exchange_rate: Schema.suspend(
    (): Schema.Schema<Models.CurrencyExchangeRate, any, any> =>
      Models.CurrencyExchangeRate as Schema.Schema<Models.CurrencyExchangeRate, any, any>
  )
})
export type TransactionPayoutTotalsAdjusted = typeof TransactionPayoutTotalsAdjusted.Type
