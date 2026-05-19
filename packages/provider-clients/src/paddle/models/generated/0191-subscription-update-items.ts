import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionUpdateItems = Schema.Union(Schema.suspend(() => Models.SubscriptionUpdateItem), Schema.suspend(() => Models.SubscriptionItemCreateWithPrice), Schema.suspend(() => Models.SubscriptionItemCreateWithPriceAndProduct))
export type SubscriptionUpdateItems = typeof SubscriptionUpdateItems.Type
