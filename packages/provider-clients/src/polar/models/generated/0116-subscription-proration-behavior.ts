import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionProrationBehavior = Schema.Literal("invoice", "prorate", "next_period", "reset")
export type SubscriptionProrationBehavior = typeof SubscriptionProrationBehavior.Type
