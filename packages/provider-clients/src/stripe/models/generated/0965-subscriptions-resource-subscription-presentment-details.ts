import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourceSubscriptionPresentmentDetails = Schema.Struct({
  presentment_currency: Schema.String
})
export type SubscriptionsResourceSubscriptionPresentmentDetails =
  typeof SubscriptionsResourceSubscriptionPresentmentDetails.Type
