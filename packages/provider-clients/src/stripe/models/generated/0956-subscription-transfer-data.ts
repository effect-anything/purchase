import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionTransferData = Schema.Struct({
  amount_percent: Schema.NullOr(Schema.Number),
  destination: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account)),
})
export type SubscriptionTransferData = typeof SubscriptionTransferData.Type
