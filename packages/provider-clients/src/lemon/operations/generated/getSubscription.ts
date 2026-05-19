import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const GetSubscriptionInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String),
})
export type GetSubscriptionInput = typeof GetSubscriptionInput.Type

export const GetSubscriptionOutput = Models.SubscriptionResponse
export type GetSubscriptionOutput = typeof GetSubscriptionOutput.Type

export const getSubscriptionOperation = defineOperation({
  id: "lemon.getSubscription",
  method: "GET",
  path: "/subscriptions/{id}",
  inputSchema: GetSubscriptionInput,
  outputSchema: GetSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get subscription
 */
export const getSubscription = (input: GetSubscriptionInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getSubscriptionOperation, input)))
