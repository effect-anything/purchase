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
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCodePayout, any, any> =>
      Models.CurrencyCodePayout as Schema.Schema<Models.CurrencyCodePayout, any, any>
  ),
  exchange_rate: Schema.suspend(
    (): Schema.Schema<Models.CurrencyExchangeRate, any, any> =>
      Models.CurrencyExchangeRate as Schema.Schema<Models.CurrencyExchangeRate, any, any>
  ),
  fee_rate: Schema.String
})
export type TransactionPayoutTotals = typeof TransactionPayoutTotals.Type
