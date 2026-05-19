import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const SubscriptionsGetInput = Schema.Struct({
  id: Schema.String,
})
export type SubscriptionsGetInput = typeof SubscriptionsGetInput.Type

export const SubscriptionsGetOutput = Models.Subscription
export type SubscriptionsGetOutput = typeof SubscriptionsGetOutput.Type

export const subscriptionsGetOperation = defineOperation({
  id: "polar.subscriptions:get",
  method: "GET",
  path: "/v1/subscriptions/{id}",
  inputSchema: SubscriptionsGetInput,
  outputSchema: SubscriptionsGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Subscription
 */
export const subscriptionsGet = (input: SubscriptionsGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(subscriptionsGetOperation, input)))
