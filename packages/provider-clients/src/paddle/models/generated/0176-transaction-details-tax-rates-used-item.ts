import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionDetailsTaxRatesUsedItem = Schema.Struct({
  tax_rate: Schema.String,
  totals: Schema.suspend(() => Models.Totals),
})
export type TransactionDetailsTaxRatesUsedItem = typeof TransactionDetailsTaxRatesUsedItem.Type
