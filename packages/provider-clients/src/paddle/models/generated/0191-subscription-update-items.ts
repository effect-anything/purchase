import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateItems = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionUpdateItem, any, any> =>
      Models.SubscriptionUpdateItem as Schema.Schema<Models.SubscriptionUpdateItem, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionItemCreateWithPrice, any, any> =>
      Models.SubscriptionItemCreateWithPrice as Schema.Schema<Models.SubscriptionItemCreateWithPrice, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.SubscriptionItemCreateWithPriceAndProduct, any, any> =>
      Models.SubscriptionItemCreateWithPriceAndProduct as Schema.Schema<
        Models.SubscriptionItemCreateWithPriceAndProduct,
        any,
        any
      >
  )
)
export type SubscriptionUpdateItems = typeof SubscriptionUpdateItems.Type
