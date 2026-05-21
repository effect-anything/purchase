import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Subscription, any, any> =>
        Models.Subscription as Schema.Schema<Models.Subscription, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type SubscriptionListResponse = typeof SubscriptionListResponse.Type
