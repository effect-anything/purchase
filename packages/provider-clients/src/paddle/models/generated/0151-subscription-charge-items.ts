import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionChargeItems = Schema.Union(Schema.suspend(() => Models.SubscriptionItemCreateWithPriceIdModel), Schema.suspend(() => Models.SubscriptionChargeCreateWithPriceModel), Schema.suspend(() => Models.SubscriptionChargeCreateWithPriceAndProductModel))
export type SubscriptionChargeItems = typeof SubscriptionChargeItems.Type
