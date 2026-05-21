import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentItem = Schema.Struct({
  item_id: Schema.suspend(
    (): Schema.Schema<Models.TransactionItemId, any, any> =>
      Models.TransactionItemId as Schema.Schema<Models.TransactionItemId, any, any>
  ),
  type: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentItemType, any, any> =>
      Models.AdjustmentItemType as Schema.Schema<Models.AdjustmentItemType, any, any>
  ),
  amount: Schema.NullOr(Schema.String),
  proration: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionItemProration, any, any> =>
        Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
    )
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentItemTotals, any, any> =>
      Models.AdjustmentItemTotals as Schema.Schema<Models.AdjustmentItemTotals, any, any>
  )
})
export type AdjustmentItem = typeof AdjustmentItem.Type
