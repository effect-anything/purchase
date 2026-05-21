import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateProduct = Schema.Struct({
  product_id: Schema.String,
  proration_behavior: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionProrationBehavior, any, any> =>
          Models.SubscriptionProrationBehavior as Schema.Schema<Models.SubscriptionProrationBehavior, any, any>
      )
    )
  )
})
export type SubscriptionUpdateProduct = typeof SubscriptionUpdateProduct.Type
