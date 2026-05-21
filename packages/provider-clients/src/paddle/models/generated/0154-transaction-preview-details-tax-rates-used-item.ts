import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewDetailsTaxRatesUsedItem = Schema.Struct({
  tax_rate: Schema.String,
  totals: Schema.suspend(
    (): Schema.Schema<Models.Totals, any, any> => Models.Totals as Schema.Schema<Models.Totals, any, any>
  )
})
export type TransactionPreviewDetailsTaxRatesUsedItem = typeof TransactionPreviewDetailsTaxRatesUsedItem.Type
