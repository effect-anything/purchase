import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionItemCreateWithPriceIdModel = Schema.Struct({
  quantity: Schema.Number,
  price_id: Schema.suspend(
    (): Schema.Schema<Models.PriceId, any, any> => Models.PriceId as Schema.Schema<Models.PriceId, any, any>
  )
})
export type SubscriptionItemCreateWithPriceIdModel = typeof SubscriptionItemCreateWithPriceIdModel.Type
