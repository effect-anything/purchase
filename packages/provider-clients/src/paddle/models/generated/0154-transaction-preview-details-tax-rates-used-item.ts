import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewDetailsTaxRatesUsedItem = Schema.Struct({
  tax_rate: Schema.String,
  totals: Schema.suspend((): Schema.Schema<Models.Totals> => Models.Totals)
})
export type TransactionPreviewDetailsTaxRatesUsedItem = typeof TransactionPreviewDetailsTaxRatesUsedItem.Type
