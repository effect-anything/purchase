import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionDetails = Schema.Struct({
  tax_rates_used: Schema.Array(Schema.suspend(() => Models.TransactionDetailsTaxRatesUsedItem)),
  totals: Schema.suspend(() => Models.TransactionTotals),
  adjusted_totals: Schema.suspend(() => Models.TransactionTotalsAdjusted),
  payout_totals: Schema.NullOr(Schema.suspend(() => Models.TransactionPayoutTotals)),
  adjusted_payout_totals: Schema.NullOr(Schema.suspend(() => Models.TransactionPayoutTotalsAdjusted)),
  line_items: Schema.Array(Schema.suspend(() => Models.TransactionDetailsLineItem)),
})
export type TransactionDetails = typeof TransactionDetails.Type
