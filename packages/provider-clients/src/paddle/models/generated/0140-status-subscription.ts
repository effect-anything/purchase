import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const StatusSubscription = Schema.Literal("active", "canceled", "past_due", "paused", "trialing")
export type StatusSubscription = typeof StatusSubscription.Type
