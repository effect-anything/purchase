import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentPayoutTotalsChargebackFee = Schema.Struct({
  amount: Schema.String,
  original: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AdjustmentPayoutTotalsChargebackFeeOriginal, any, any> =>
        Models.AdjustmentPayoutTotalsChargebackFeeOriginal as Schema.Schema<
          Models.AdjustmentPayoutTotalsChargebackFeeOriginal,
          any,
          any
        >
    )
  )
})
export type AdjustmentPayoutTotalsChargebackFee = typeof AdjustmentPayoutTotalsChargebackFee.Type
