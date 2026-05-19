import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetSubscriptionsSubscriptionExposedIdInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  subscription_exposed_id: Schema.String,
})
export type GetSubscriptionsSubscriptionExposedIdInput = typeof GetSubscriptionsSubscriptionExposedIdInput.Type

export const GetSubscriptionsSubscriptionExposedIdOutput = Models.Subscription
export type GetSubscriptionsSubscriptionExposedIdOutput = typeof GetSubscriptionsSubscriptionExposedIdOutput.Type

export const getSubscriptionsSubscriptionExposedIdOperation = defineOperation({
  id: "stripe.GetSubscriptionsSubscriptionExposedId",
  method: "GET",
  path: "/v1/subscriptions/{subscription_exposed_id}",
  inputSchema: GetSubscriptionsSubscriptionExposedIdInput,
  outputSchema: GetSubscriptionsSubscriptionExposedIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["subscription_exposed_id"],
  queryParams: ["expand"]
})

/**
 * Retrieve a subscription
 */
export const getSubscriptionsSubscriptionExposedId = (input: GetSubscriptionsSubscriptionExposedIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getSubscriptionsSubscriptionExposedIdOperation, input)))
