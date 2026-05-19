import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionNextTransaction = Schema.Struct({
  billing_period: Schema.suspend(() => Models.TimePeriod),
  details: Schema.suspend(() => Models.TransactionPreviewDetails),
  adjustments: Schema.Array(Schema.suspend(() => Models.AdjustmentPreview)),
})
export type SubscriptionNextTransaction = typeof SubscriptionNextTransaction.Type
