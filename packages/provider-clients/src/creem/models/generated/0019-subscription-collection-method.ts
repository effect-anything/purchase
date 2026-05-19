import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionCollectionMethod = Schema.Literal("charge_automatically")
export type SubscriptionCollectionMethod = typeof SubscriptionCollectionMethod.Type
