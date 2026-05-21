import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionChargeCreateWithPriceAndProductModel = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionChargeCreateWithPriceAndProductPrice> =>
      Models.SubscriptionChargeCreateWithPriceAndProductPrice
  )
})
export type SubscriptionChargeCreateWithPriceAndProductModel =
  typeof SubscriptionChargeCreateWithPriceAndProductModel.Type
