import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentItem = Schema.Struct({
  item_id: Schema.suspend((): Schema.Schema<Models.TransactionItemId> => Models.TransactionItemId),
  type: Schema.suspend((): Schema.Schema<Models.AdjustmentItemType> => Models.AdjustmentItemType),
  amount: Schema.NullOr(Schema.String),
  proration: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration)
  ),
  totals: Schema.suspend((): Schema.Schema<Models.AdjustmentItemTotals> => Models.AdjustmentItemTotals)
})
export type AdjustmentItem = typeof AdjustmentItem.Type
