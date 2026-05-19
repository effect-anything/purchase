import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentPayoutTotals = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  chargeback_fee: Schema.optional(Schema.suspend(() => Models.AdjustmentPayoutTotalsChargebackFee)),
  earnings: Schema.String,
  currency_code: Schema.suspend(() => Models.CurrencyCodePayout),
})
export type AdjustmentPayoutTotals = typeof AdjustmentPayoutTotals.Type
