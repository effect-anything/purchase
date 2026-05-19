import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentPayoutTotalsChargebackFee = Schema.Struct({
  amount: Schema.String,
  original: Schema.NullOr(Schema.suspend(() => Models.AdjustmentPayoutTotalsChargebackFeeOriginal)),
})
export type AdjustmentPayoutTotalsChargebackFee = typeof AdjustmentPayoutTotalsChargebackFee.Type
