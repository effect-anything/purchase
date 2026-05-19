import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentItem = Schema.Struct({
  item_id: Schema.suspend(() => Models.TransactionItemId),
  type: Schema.suspend(() => Models.AdjustmentItemType),
  amount: Schema.NullOr(Schema.String),
  proration: Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration)),
  totals: Schema.suspend(() => Models.AdjustmentItemTotals),
})
export type AdjustmentItem = typeof AdjustmentItem.Type
