import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const SubscriptionsCreateInput = Schema.Struct({})
export type SubscriptionsCreateInput = typeof SubscriptionsCreateInput.Type

export const SubscriptionsCreateOutput = Models.Subscription
export type SubscriptionsCreateOutput = typeof SubscriptionsCreateOutput.Type

export const subscriptionsCreateOperation = defineOperation({
  id: "polar.subscriptions:create",
  method: "POST",
  path: "/v1/subscriptions/",
  inputSchema: SubscriptionsCreateInput,
  outputSchema: SubscriptionsCreateOutput,
  status: [201],
  contentType: "json"
})

/**
 * Create Subscription
 */
export const subscriptionsCreate = (input: SubscriptionsCreateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(subscriptionsCreateOperation, input)))
