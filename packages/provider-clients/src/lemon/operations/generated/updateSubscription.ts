import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const UpdateSubscriptionInput = Schema.Struct({
  id: Schema.String,
  data: Models.SubscriptionUpdateData,
})
export type UpdateSubscriptionInput = typeof UpdateSubscriptionInput.Type

export const UpdateSubscriptionOutput = Models.SubscriptionResponse
export type UpdateSubscriptionOutput = typeof UpdateSubscriptionOutput.Type

export const updateSubscriptionOperation = defineOperation({
  id: "lemon.updateSubscription",
  method: "PATCH",
  path: "/subscriptions/{id}",
  inputSchema: UpdateSubscriptionInput,
  outputSchema: UpdateSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["data"]
})

/**
 * Update subscription
 */
export const updateSubscription = (input: UpdateSubscriptionInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(updateSubscriptionOperation, input)))
