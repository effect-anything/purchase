import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentPreview = Schema.Struct({
  transaction_id: Schema.suspend(() => Models.TransactionId),
  items: Schema.Array(Schema.suspend(() => Models.AdjustmentItem)),
  totals: Schema.suspend(() => Models.AdjustmentTotals),
})
export type AdjustmentPreview = typeof AdjustmentPreview.Type
