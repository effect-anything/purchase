import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderBillingReason = Schema.Literal(
  "purchase",
  "subscription_create",
  "subscription_cycle",
  "subscription_update"
)
export type OrderBillingReason = typeof OrderBillingReason.Type
