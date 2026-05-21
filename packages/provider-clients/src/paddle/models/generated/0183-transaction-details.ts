import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionDetails = Schema.Struct({
  tax_rates_used: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionDetailsTaxRatesUsedItem> => Models.TransactionDetailsTaxRatesUsedItem
    )
  ),
  totals: Schema.suspend((): Schema.Schema<Models.TransactionTotals> => Models.TransactionTotals),
  adjusted_totals: Schema.suspend(
    (): Schema.Schema<Models.TransactionTotalsAdjusted> => Models.TransactionTotalsAdjusted
  ),
  payout_totals: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.TransactionPayoutTotals> => Models.TransactionPayoutTotals)
  ),
  adjusted_payout_totals: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.TransactionPayoutTotalsAdjusted> => Models.TransactionPayoutTotalsAdjusted)
  ),
  line_items: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.TransactionDetailsLineItem> => Models.TransactionDetailsLineItem)
  )
})
export type TransactionDetails = typeof TransactionDetails.Type
