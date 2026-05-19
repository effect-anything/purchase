import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionChargeCreateWithPriceModel = Schema.Struct({
  quantity: Schema.Number,
  price: Schema.suspend(() => Models.SubscriptionChargeCreateWithPriceInternalPriceModel),
})
export type SubscriptionChargeCreateWithPriceModel = typeof SubscriptionChargeCreateWithPriceModel.Type
