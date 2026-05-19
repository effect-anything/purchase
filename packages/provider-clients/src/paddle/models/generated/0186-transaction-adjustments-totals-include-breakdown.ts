import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionAdjustmentsTotalsIncludeBreakdown = Schema.Struct({
  credit: Schema.String,
  refund: Schema.String,
  chargeback: Schema.String,
})
export type TransactionAdjustmentsTotalsIncludeBreakdown = typeof TransactionAdjustmentsTotalsIncludeBreakdown.Type
