import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionDetails = Schema.Struct({
  tax_rates_used: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionDetailsTaxRatesUsedItem, any, any> =>
        Models.TransactionDetailsTaxRatesUsedItem as Schema.Schema<Models.TransactionDetailsTaxRatesUsedItem, any, any>
    )
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.TransactionTotals, any, any> =>
      Models.TransactionTotals as Schema.Schema<Models.TransactionTotals, any, any>
  ),
  adjusted_totals: Schema.suspend(
    (): Schema.Schema<Models.TransactionTotalsAdjusted, any, any> =>
      Models.TransactionTotalsAdjusted as Schema.Schema<Models.TransactionTotalsAdjusted, any, any>
  ),
  payout_totals: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPayoutTotals, any, any> =>
        Models.TransactionPayoutTotals as Schema.Schema<Models.TransactionPayoutTotals, any, any>
    )
  ),
  adjusted_payout_totals: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPayoutTotalsAdjusted, any, any> =>
        Models.TransactionPayoutTotalsAdjusted as Schema.Schema<Models.TransactionPayoutTotalsAdjusted, any, any>
    )
  ),
  line_items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionDetailsLineItem, any, any> =>
        Models.TransactionDetailsLineItem as Schema.Schema<Models.TransactionDetailsLineItem, any, any>
    )
  )
})
export type TransactionDetails = typeof TransactionDetails.Type
