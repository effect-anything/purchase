import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateItems = Schema.Union(
  Schema.suspend((): Schema.Schema<Models.SubscriptionUpdateItem> => Models.SubscriptionUpdateItem),
  Schema.suspend((): Schema.Schema<Models.SubscriptionItemCreateWithPrice> => Models.SubscriptionItemCreateWithPrice),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionItemCreateWithPriceAndProduct> =>
      Models.SubscriptionItemCreateWithPriceAndProduct
  )
)
export type SubscriptionUpdateItems = typeof SubscriptionUpdateItems.Type
