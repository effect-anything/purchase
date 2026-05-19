import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const SubscriptionsUpdateInput = Schema.Struct({
  id: Schema.String,
})
export type SubscriptionsUpdateInput = typeof SubscriptionsUpdateInput.Type

export const SubscriptionsUpdateOutput = Models.Subscription
export type SubscriptionsUpdateOutput = typeof SubscriptionsUpdateOutput.Type

export const subscriptionsUpdateOperation = defineOperation({
  id: "polar.subscriptions:update",
  method: "PATCH",
  path: "/v1/subscriptions/{id}",
  inputSchema: SubscriptionsUpdateInput,
  outputSchema: SubscriptionsUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Update Subscription
 */
export const subscriptionsUpdate = (input: SubscriptionsUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(subscriptionsUpdateOperation, input)))
