import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionStatusQuery = Schema.Literal("active", "canceled", "past_due", "paused", "trialing")
export type SubscriptionStatusQuery = typeof SubscriptionStatusQuery.Type
