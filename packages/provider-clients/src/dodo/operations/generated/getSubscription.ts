import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String,
})
export type GetSubscriptionInput = typeof GetSubscriptionInput.Type

export const GetSubscriptionOutput = Models.Subscription
export type GetSubscriptionOutput = typeof GetSubscriptionOutput.Type

export const getSubscriptionOperation = defineOperation({
  id: "dodo.getSubscription",
  method: "GET",
  path: "/subscriptions/{subscription_id}",
  inputSchema: GetSubscriptionInput,
  outputSchema: GetSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"]
})

/**
 * Get subscription
 */
export const getSubscription = (input: GetSubscriptionInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getSubscriptionOperation, input)))
