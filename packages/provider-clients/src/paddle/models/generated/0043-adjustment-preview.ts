import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentPreview = Schema.Struct({
  transaction_id: Schema.suspend(
    (): Schema.Schema<Models.TransactionId, any, any> =>
      Models.TransactionId as Schema.Schema<Models.TransactionId, any, any>
  ),
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.AdjustmentItem, any, any> =>
        Models.AdjustmentItem as Schema.Schema<Models.AdjustmentItem, any, any>
    )
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentTotals, any, any> =>
      Models.AdjustmentTotals as Schema.Schema<Models.AdjustmentTotals, any, any>
  )
})
export type AdjustmentPreview = typeof AdjustmentPreview.Type
