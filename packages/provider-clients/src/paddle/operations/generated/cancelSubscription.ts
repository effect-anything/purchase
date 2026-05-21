import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CancelSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String,
  effective_from: Schema.optional(Schema.NullOr(Models.EffectiveFrom))
})
export type CancelSubscriptionInput = typeof CancelSubscriptionInput.Type

export const CancelSubscriptionOutput = Schema.Struct({
  data: Models.Subscription,
  meta: Models.Meta
})
export type CancelSubscriptionOutput = typeof CancelSubscriptionOutput.Type

export const cancelSubscriptionOperation = defineOperation({
  id: "paddle.cancel-subscription",
  method: "POST",
  path: "/subscriptions/{subscription_id}/cancel",
  inputSchema: CancelSubscriptionInput,
  outputSchema: CancelSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"],
  bodyParams: ["effective_from"]
})

/**
 * Cancel a subscription
 */
export const cancelSubscription = (input: CancelSubscriptionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(cancelSubscriptionOperation, input)))
