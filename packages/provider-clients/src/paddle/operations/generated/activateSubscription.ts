import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ActivateSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String
})
export type ActivateSubscriptionInput = typeof ActivateSubscriptionInput.Type

export const ActivateSubscriptionOutput = Schema.Struct({
  data: Models.Subscription,
  meta: Models.Meta
})
export type ActivateSubscriptionOutput = typeof ActivateSubscriptionOutput.Type

export const activateSubscriptionOperation = defineOperation({
  id: "paddle.activate-subscription",
  method: "POST",
  path: "/subscriptions/{subscription_id}/activate",
  inputSchema: ActivateSubscriptionInput,
  outputSchema: ActivateSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"]
})

/**
 * Activate a trialing subscription
 */
export const activateSubscription = (input: ActivateSubscriptionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(activateSubscriptionOperation, input)))
