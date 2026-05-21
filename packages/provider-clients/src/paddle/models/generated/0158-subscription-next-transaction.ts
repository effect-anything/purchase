import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionNextTransaction = Schema.Struct({
  billing_period: Schema.suspend((): Schema.Schema<Models.TimePeriod> => Models.TimePeriod),
  details: Schema.suspend((): Schema.Schema<Models.TransactionPreviewDetails> => Models.TransactionPreviewDetails),
  adjustments: Schema.Array(Schema.suspend((): Schema.Schema<Models.AdjustmentPreview> => Models.AdjustmentPreview))
})
export type SubscriptionNextTransaction = typeof SubscriptionNextTransaction.Type
