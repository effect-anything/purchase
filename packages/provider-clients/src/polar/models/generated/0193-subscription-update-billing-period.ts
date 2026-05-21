import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateBillingPeriod = Schema.Struct({
  current_billing_period_end: Schema.String
})
export type SubscriptionUpdateBillingPeriod = typeof SubscriptionUpdateBillingPeriod.Type
