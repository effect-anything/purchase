import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjustedChargebackFee = Schema.Struct({
  amount: Schema.String,
  original: Schema.NullOr(Schema.suspend(() => Models.TransactionPayoutTotalsAdjustedChargebackFeeOriginal)),
})
export type TransactionPayoutTotalsAdjustedChargebackFee = typeof TransactionPayoutTotalsAdjustedChargebackFee.Type
