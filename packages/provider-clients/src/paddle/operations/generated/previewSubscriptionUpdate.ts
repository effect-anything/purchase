import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const PreviewSubscriptionUpdateInput = Schema.Struct({
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
  on_payment_failure: Schema.optional(Models.SubscriptionOnPaymentFailure),
})
export type PreviewSubscriptionUpdateInput = typeof PreviewSubscriptionUpdateInput.Type

export const PreviewSubscriptionUpdateOutput = Schema.Struct({
  data: Models.SubscriptionPreview,
  meta: Models.Meta,
})
export type PreviewSubscriptionUpdateOutput = typeof PreviewSubscriptionUpdateOutput.Type

export const previewSubscriptionUpdateOperation = defineOperation({
  id: "paddle.preview-subscription-update",
  method: "PATCH",
  path: "/subscriptions/{subscription_id}/preview",
  inputSchema: PreviewSubscriptionUpdateInput,
  outputSchema: PreviewSubscriptionUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"],
  bodyParams: ["customer_id", "address_id", "business_id", "currency_code", "next_billed_at", "discount", "collection_mode", "billing_details", "scheduled_change", "items", "custom_data", "proration_billing_mode", "on_payment_failure"]
})

/**
 * Preview an update to a subscription
 */
export const previewSubscriptionUpdate = (input: PreviewSubscriptionUpdateInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(previewSubscriptionUpdateOperation, input)))
