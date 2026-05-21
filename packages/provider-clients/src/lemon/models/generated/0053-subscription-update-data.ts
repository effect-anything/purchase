import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateData = Schema.Struct({
  type: Schema.Literal("subscriptions"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionUpdateAttributes, any, any> =>
      Models.SubscriptionUpdateAttributes as Schema.Schema<Models.SubscriptionUpdateAttributes, any, any>
  )
})
export type SubscriptionUpdateData = typeof SubscriptionUpdateData.Type
