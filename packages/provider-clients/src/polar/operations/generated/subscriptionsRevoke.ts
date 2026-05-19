import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const SubscriptionsRevokeInput = Schema.Struct({
  id: Schema.String,
})
export type SubscriptionsRevokeInput = typeof SubscriptionsRevokeInput.Type

export const SubscriptionsRevokeOutput = Models.Subscription
export type SubscriptionsRevokeOutput = typeof SubscriptionsRevokeOutput.Type

export const subscriptionsRevokeOperation = defineOperation({
  id: "polar.subscriptions:revoke",
  method: "DELETE",
  path: "/v1/subscriptions/{id}",
  inputSchema: SubscriptionsRevokeInput,
  outputSchema: SubscriptionsRevokeOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Revoke Subscription
 */
export const subscriptionsRevoke = (input: SubscriptionsRevokeInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(subscriptionsRevokeOperation, input)))
