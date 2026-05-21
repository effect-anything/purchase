import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionItemCreateWithPrice = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(
    (): Schema.Schema<Models.TransactionPriceCreateWithProductId, any, any> =>
      Models.TransactionPriceCreateWithProductId as Schema.Schema<Models.TransactionPriceCreateWithProductId, any, any>
  )
})
export type SubscriptionItemCreateWithPrice = typeof SubscriptionItemCreateWithPrice.Type
