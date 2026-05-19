import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ItemSubscriptionStatus = Schema.Literal("active", "inactive", "trialing")
export type ItemSubscriptionStatus = typeof ItemSubscriptionStatus.Type
