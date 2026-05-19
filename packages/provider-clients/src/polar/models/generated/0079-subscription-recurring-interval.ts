import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionRecurringInterval = Schema.Literal("day", "week", "month", "year")
export type SubscriptionRecurringInterval = typeof SubscriptionRecurringInterval.Type
