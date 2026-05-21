import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const DeleteSubscriptionsSubscriptionExposedIdDiscountInput = Schema.Struct({
  subscription_exposed_id: Schema.String
})
export type DeleteSubscriptionsSubscriptionExposedIdDiscountInput =
  typeof DeleteSubscriptionsSubscriptionExposedIdDiscountInput.Type

export const DeleteSubscriptionsSubscriptionExposedIdDiscountOutput = Models.DeletedDiscount
export type DeleteSubscriptionsSubscriptionExposedIdDiscountOutput =
  typeof DeleteSubscriptionsSubscriptionExposedIdDiscountOutput.Type

export const deleteSubscriptionsSubscriptionExposedIdDiscountOperation = defineOperation({
  id: "stripe.DeleteSubscriptionsSubscriptionExposedIdDiscount",
  method: "DELETE",
  path: "/v1/subscriptions/{subscription_exposed_id}/discount",
  inputSchema: DeleteSubscriptionsSubscriptionExposedIdDiscountInput,
  outputSchema: DeleteSubscriptionsSubscriptionExposedIdDiscountOutput,
  status: [200],
  contentType: "form",
  pathParams: ["subscription_exposed_id"]
})

/**
 * Delete a subscription discount
 */
export const deleteSubscriptionsSubscriptionExposedIdDiscount = (
  input: DeleteSubscriptionsSubscriptionExposedIdDiscountInput
) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(deleteSubscriptionsSubscriptionExposedIdDiscountOperation, input))
  )
