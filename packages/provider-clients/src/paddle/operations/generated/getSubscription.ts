import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetSubscriptionInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.SubscriptionIncludeEnum)),
  subscription_id: Schema.String
})
export type GetSubscriptionInput = typeof GetSubscriptionInput.Type

export const GetSubscriptionOutput = Schema.Struct({
  data: Models.SubscriptionIncludes,
  meta: Models.Meta
})
export type GetSubscriptionOutput = typeof GetSubscriptionOutput.Type

export const getSubscriptionOperation = defineOperation({
  id: "paddle.get-subscription",
  method: "GET",
  path: "/subscriptions/{subscription_id}",
  inputSchema: GetSubscriptionInput,
  outputSchema: GetSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"],
  queryParams: ["include"]
})

/**
 * Get a subscription
 */
export const getSubscription = (input: GetSubscriptionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getSubscriptionOperation, input)))
