import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjustedChargebackFeeOriginal = Schema.Struct({
  amount: Schema.String,
  currency_code: Schema.suspend(() => Models.CurrencyCodeChargeback),
})
export type TransactionPayoutTotalsAdjustedChargebackFeeOriginal = typeof TransactionPayoutTotalsAdjustedChargebackFeeOriginal.Type
