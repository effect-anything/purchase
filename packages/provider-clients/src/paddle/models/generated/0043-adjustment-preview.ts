import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentPreview = Schema.Struct({
  transaction_id: Schema.suspend((): Schema.Schema<Models.TransactionId> => Models.TransactionId),
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.AdjustmentItem> => Models.AdjustmentItem)),
  totals: Schema.suspend((): Schema.Schema<Models.AdjustmentTotals> => Models.AdjustmentTotals)
})
export type AdjustmentPreview = typeof AdjustmentPreview.Type
