import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionBillingThresholds = Schema.Struct({
  amount_gte: Schema.NullOr(Schema.Number),
  reset_billing_cycle_anchor: Schema.NullOr(Schema.Boolean)
})
export type SubscriptionBillingThresholds = typeof SubscriptionBillingThresholds.Type
