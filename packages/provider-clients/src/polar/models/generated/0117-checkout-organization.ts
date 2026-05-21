import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutOrganization = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  name: Schema.String,
  slug: Schema.String,
  avatar_url: Schema.NullOr(Schema.String),
  proration_behavior: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionProrationBehavior, any, any> =>
      Models.SubscriptionProrationBehavior as Schema.Schema<Models.SubscriptionProrationBehavior, any, any>
  ),
  allow_customer_updates: Schema.Boolean
})
export type CheckoutOrganization = typeof CheckoutOrganization.Type
