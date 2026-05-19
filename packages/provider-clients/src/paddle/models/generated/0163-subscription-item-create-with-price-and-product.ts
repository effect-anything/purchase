import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionItemCreateWithPriceAndProduct = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(() => Models.TransactionPriceCreateWithProduct),
})
export type SubscriptionItemCreateWithPriceAndProduct = typeof SubscriptionItemCreateWithPriceAndProduct.Type
