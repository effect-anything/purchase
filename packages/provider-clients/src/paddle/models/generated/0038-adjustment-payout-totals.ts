import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentPayoutTotals = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  chargeback_fee: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AdjustmentPayoutTotalsChargebackFee, any, any> =>
        Models.AdjustmentPayoutTotalsChargebackFee as Schema.Schema<
          Models.AdjustmentPayoutTotalsChargebackFee,
          any,
          any
        >
    )
  ),
  earnings: Schema.String,
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCodePayout, any, any> =>
      Models.CurrencyCodePayout as Schema.Schema<Models.CurrencyCodePayout, any, any>
  )
})
export type AdjustmentPayoutTotals = typeof AdjustmentPayoutTotals.Type
