import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionSortProperty = Schema.Literal("customer", "-customer", "status", "-status", "started_at", "-started_at", "current_period_end", "-current_period_end", "ended_at", "-ended_at", "ends_at", "-ends_at", "amount", "-amount", "product", "-product", "discount", "-discount")
export type SubscriptionSortProperty = typeof SubscriptionSortProperty.Type
