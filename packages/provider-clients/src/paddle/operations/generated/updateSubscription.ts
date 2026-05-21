import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String,
  customer_id: Schema.optional(Models.CustomerId),
  address_id: Schema.optional(Models.AddressId),
  business_id: Schema.optional(Schema.NullOr(Models.BusinessId)),
  currency_code: Schema.optional(Models.CurrencyCode),
  next_billed_at: Schema.optional(Models.Timestamp),
  discount: Schema.optional(Schema.NullOr(Models.SubscriptionUpdateDiscount)),
  collection_mode: Schema.optional(Models.CollectionMode),
  billing_details: Schema.optional(Schema.NullOr(Models.BillingDetailsUpdate)),
  scheduled_change: Schema.optional(Schema.Unknown),
  items: Schema.optional(Schema.Array(Models.SubscriptionUpdateItems)),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  proration_billing_mode: Schema.optional(Models.SubscriptionUpdateProrationBillingMode),
  on_payment_failure: Schema.optional(Models.SubscriptionOnPaymentFailure)
})
export type UpdateSubscriptionInput = typeof UpdateSubscriptionInput.Type

export const UpdateSubscriptionOutput = Schema.Struct({
  data: Models.Subscription,
  meta: Models.Meta
})
export type UpdateSubscriptionOutput = typeof UpdateSubscriptionOutput.Type

export const updateSubscriptionOperation = defineOperation({
  id: "paddle.update-subscription",
  method: "PATCH",
  path: "/subscriptions/{subscription_id}",
  inputSchema: UpdateSubscriptionInput,
  outputSchema: UpdateSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"],
  bodyParams: [
    "customer_id",
    "address_id",
    "business_id",
    "currency_code",
    "next_billed_at",
    "discount",
    "collection_mode",
    "billing_details",
    "scheduled_change",
    "items",
    "custom_data",
    "proration_billing_mode",
    "on_payment_failure"
  ]
})

/**
 * Update a subscription
 */
export const updateSubscription = (input: UpdateSubscriptionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updateSubscriptionOperation, input)))
