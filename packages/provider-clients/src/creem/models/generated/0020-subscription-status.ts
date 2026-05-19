import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionStatus = Schema.Literal("active", "canceled", "unpaid", "paused", "trialing", "scheduled_cancel")
export type SubscriptionStatus = typeof SubscriptionStatus.Type
