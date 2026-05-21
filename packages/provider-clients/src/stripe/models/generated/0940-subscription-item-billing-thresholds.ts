import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionItemBillingThresholds = Schema.Struct({
  usage_gte: Schema.NullOr(Schema.Number)
})
export type SubscriptionItemBillingThresholds = typeof SubscriptionItemBillingThresholds.Type
