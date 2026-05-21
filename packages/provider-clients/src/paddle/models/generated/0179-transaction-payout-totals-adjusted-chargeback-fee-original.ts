import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjustedChargebackFeeOriginal = Schema.Struct({
  amount: Schema.String,
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCodeChargeback, any, any> =>
      Models.CurrencyCodeChargeback as Schema.Schema<Models.CurrencyCodeChargeback, any, any>
  )
})
export type TransactionPayoutTotalsAdjustedChargebackFeeOriginal =
  typeof TransactionPayoutTotalsAdjustedChargebackFeeOriginal.Type
