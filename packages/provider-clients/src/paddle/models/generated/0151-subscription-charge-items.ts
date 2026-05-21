import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionChargeItems = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionItemCreateWithPriceIdModel, any, any> =>
      Models.SubscriptionItemCreateWithPriceIdModel as Schema.Schema<
        Models.SubscriptionItemCreateWithPriceIdModel,
        any,
        any
      >
  ),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionChargeCreateWithPriceModel, any, any> =>
      Models.SubscriptionChargeCreateWithPriceModel as Schema.Schema<
        Models.SubscriptionChargeCreateWithPriceModel,
        any,
        any
      >
  ),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionChargeCreateWithPriceAndProductModel, any, any> =>
      Models.SubscriptionChargeCreateWithPriceAndProductModel as Schema.Schema<
        Models.SubscriptionChargeCreateWithPriceAndProductModel,
        any,
        any
      >
  )
)
export type SubscriptionChargeItems = typeof SubscriptionChargeItems.Type
