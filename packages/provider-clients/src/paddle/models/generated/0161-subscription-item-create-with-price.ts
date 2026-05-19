import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionItemCreateWithPrice = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(() => Models.TransactionPriceCreateWithProductId),
})
export type SubscriptionItemCreateWithPrice = typeof SubscriptionItemCreateWithPrice.Type
