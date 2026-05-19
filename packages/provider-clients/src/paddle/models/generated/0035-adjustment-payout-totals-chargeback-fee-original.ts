import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentPayoutTotalsChargebackFeeOriginal = Schema.Struct({
  amount: Schema.String,
  currency_code: Schema.suspend(() => Models.CurrencyCodeChargeback),
})
export type AdjustmentPayoutTotalsChargebackFeeOriginal = typeof AdjustmentPayoutTotalsChargebackFeeOriginal.Type
