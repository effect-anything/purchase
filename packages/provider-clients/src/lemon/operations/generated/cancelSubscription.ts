import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const CancelSubscriptionInput = Schema.Struct({
  id: Schema.String,
})
export type CancelSubscriptionInput = typeof CancelSubscriptionInput.Type

export const CancelSubscriptionOutput = Models.SubscriptionResponse
export type CancelSubscriptionOutput = typeof CancelSubscriptionOutput.Type

export const cancelSubscriptionOperation = defineOperation({
  id: "lemon.cancelSubscription",
  method: "DELETE",
  path: "/subscriptions/{id}",
  inputSchema: CancelSubscriptionInput,
  outputSchema: CancelSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Cancel subscription
 */
export const cancelSubscription = (input: CancelSubscriptionInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(cancelSubscriptionOperation, input)))
