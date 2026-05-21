import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewDetails = Schema.Struct({
  tax_rates_used: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPreviewDetailsTaxRatesUsedItem, any, any> =>
        Models.TransactionPreviewDetailsTaxRatesUsedItem as Schema.Schema<
          Models.TransactionPreviewDetailsTaxRatesUsedItem,
          any,
          any
        >
    )
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.TransactionTotals, any, any> =>
      Models.TransactionTotals as Schema.Schema<Models.TransactionTotals, any, any>
  ),
  line_items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPreviewLineItem, any, any> =>
        Models.TransactionPreviewLineItem as Schema.Schema<Models.TransactionPreviewLineItem, any, any>
    )
  )
})
export type TransactionPreviewDetails = typeof TransactionPreviewDetails.Type
