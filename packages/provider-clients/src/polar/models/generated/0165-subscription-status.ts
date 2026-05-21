import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionStatus = Schema.Literal(
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid"
)
export type SubscriptionStatus = typeof SubscriptionStatus.Type
