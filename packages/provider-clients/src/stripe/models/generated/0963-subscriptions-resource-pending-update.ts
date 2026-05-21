import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourcePendingUpdate = Schema.Struct({
  billing_cycle_anchor: Schema.NullOr(Schema.Number),
  expires_at: Schema.Number,
  subscription_items: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionItem, any, any> =>
          Models.SubscriptionItem as Schema.Schema<Models.SubscriptionItem, any, any>
      )
    )
  ),
  trial_end: Schema.NullOr(Schema.Number),
  trial_from_plan: Schema.NullOr(Schema.Boolean)
})
export type SubscriptionsResourcePendingUpdate = typeof SubscriptionsResourcePendingUpdate.Type
