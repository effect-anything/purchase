import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const DeleteSubscriptionsSubscriptionExposedIdInput = Schema.Struct({
  subscription_exposed_id: Schema.String,
  cancellation_details: Schema.optional(
    Schema.Struct({
      comment: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
      feedback: Schema.optional(
        Schema.Literal(
          "",
          "customer_service",
          "low_quality",
          "missing_features",
          "other",
          "switched_service",
          "too_complex",
          "too_expensive",
          "unused"
        )
      )
    })
  ),
  expand: Schema.optional(Schema.Array(Schema.String)),
  invoice_now: Schema.optional(Schema.Boolean),
  prorate: Schema.optional(Schema.Boolean)
})
export type DeleteSubscriptionsSubscriptionExposedIdInput = typeof DeleteSubscriptionsSubscriptionExposedIdInput.Type

export const DeleteSubscriptionsSubscriptionExposedIdOutput = Models.Subscription
export type DeleteSubscriptionsSubscriptionExposedIdOutput = typeof DeleteSubscriptionsSubscriptionExposedIdOutput.Type

export const deleteSubscriptionsSubscriptionExposedIdOperation = defineOperation({
  id: "stripe.DeleteSubscriptionsSubscriptionExposedId",
  method: "DELETE",
  path: "/v1/subscriptions/{subscription_exposed_id}",
  inputSchema: DeleteSubscriptionsSubscriptionExposedIdInput,
  outputSchema: DeleteSubscriptionsSubscriptionExposedIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["subscription_exposed_id"],
  bodyParams: ["cancellation_details", "expand", "invoice_now", "prorate"]
})

/**
 * Cancel a subscription
 */
export const deleteSubscriptionsSubscriptionExposedId = (input: DeleteSubscriptionsSubscriptionExposedIdInput) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(deleteSubscriptionsSubscriptionExposedIdOperation, input))
  )
