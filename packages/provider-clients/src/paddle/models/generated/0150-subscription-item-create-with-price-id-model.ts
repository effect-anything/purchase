import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionItemCreateWithPriceIdModel = Schema.Struct({
  quantity: Schema.Number,
  price_id: Schema.suspend(() => Models.PriceId),
})
export type SubscriptionItemCreateWithPriceIdModel = typeof SubscriptionItemCreateWithPriceIdModel.Type
