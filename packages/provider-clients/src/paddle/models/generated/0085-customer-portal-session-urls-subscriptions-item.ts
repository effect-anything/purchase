import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerPortalSessionUrlsSubscriptionsItem = Schema.Struct({
  id: Schema.suspend(() => Models.SubscriptionId),
  cancel_subscription: Schema.String,
  update_subscription_payment_method: Schema.String,
})
export type CustomerPortalSessionUrlsSubscriptionsItem = typeof CustomerPortalSessionUrlsSubscriptionsItem.Type
