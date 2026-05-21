import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionItemCreateWithPriceAndProduct = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(
    (): Schema.Schema<Models.TransactionPriceCreateWithProduct, any, any> =>
      Models.TransactionPriceCreateWithProduct as Schema.Schema<Models.TransactionPriceCreateWithProduct, any, any>
  )
})
export type SubscriptionItemCreateWithPriceAndProduct = typeof SubscriptionItemCreateWithPriceAndProduct.Type
