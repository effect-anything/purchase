import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewDetails = Schema.Struct({
  tax_rates_used: Schema.Array(Schema.suspend(() => Models.TransactionPreviewDetailsTaxRatesUsedItem)),
  totals: Schema.suspend(() => Models.TransactionTotals),
  line_items: Schema.Array(Schema.suspend(() => Models.TransactionPreviewLineItem)),
})
export type TransactionPreviewDetails = typeof TransactionPreviewDetails.Type
