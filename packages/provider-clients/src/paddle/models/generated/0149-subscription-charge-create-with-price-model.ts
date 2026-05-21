import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionChargeCreateWithPriceModel = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionChargeCreateWithPriceInternalPriceModel, any, any> =>
      Models.SubscriptionChargeCreateWithPriceInternalPriceModel as Schema.Schema<
        Models.SubscriptionChargeCreateWithPriceInternalPriceModel,
        any,
        any
      >
  )
})
export type SubscriptionChargeCreateWithPriceModel = typeof SubscriptionChargeCreateWithPriceModel.Type
