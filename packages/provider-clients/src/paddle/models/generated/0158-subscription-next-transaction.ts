import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionNextTransaction = Schema.Struct({
  billing_period: Schema.suspend(
    (): Schema.Schema<Models.TimePeriod, any, any> => Models.TimePeriod as Schema.Schema<Models.TimePeriod, any, any>
  ),
  details: Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewDetails, any, any> =>
      Models.TransactionPreviewDetails as Schema.Schema<Models.TransactionPreviewDetails, any, any>
  ),
  adjustments: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.AdjustmentPreview, any, any> =>
        Models.AdjustmentPreview as Schema.Schema<Models.AdjustmentPreview, any, any>
    )
  )
})
export type SubscriptionNextTransaction = typeof SubscriptionNextTransaction.Type
