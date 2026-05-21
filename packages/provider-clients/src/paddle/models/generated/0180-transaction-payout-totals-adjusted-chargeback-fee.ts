import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPayoutTotalsAdjustedChargebackFee = Schema.Struct({
  amount: Schema.String,
  original: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPayoutTotalsAdjustedChargebackFeeOriginal, any, any> =>
        Models.TransactionPayoutTotalsAdjustedChargebackFeeOriginal as Schema.Schema<
          Models.TransactionPayoutTotalsAdjustedChargebackFeeOriginal,
          any,
          any
        >
    )
  )
})
export type TransactionPayoutTotalsAdjustedChargebackFee = typeof TransactionPayoutTotalsAdjustedChargebackFee.Type
