import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionChargeItems = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionItemCreateWithPriceIdModel> => Models.SubscriptionItemCreateWithPriceIdModel
  ),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionChargeCreateWithPriceModel> => Models.SubscriptionChargeCreateWithPriceModel
  ),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionChargeCreateWithPriceAndProductModel> =>
      Models.SubscriptionChargeCreateWithPriceAndProductModel
  )
)
export type SubscriptionChargeItems = typeof SubscriptionChargeItems.Type
