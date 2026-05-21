import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CancelSubscriptionInput = Schema.Struct({
  id: Schema.String,
  mode: Schema.optional(Schema.Literal("immediate", "scheduled")),
  onExecute: Schema.optional(Schema.Literal("cancel", "pause"))
})
export type CancelSubscriptionInput = typeof CancelSubscriptionInput.Type

export const CancelSubscriptionOutput = Models.SubscriptionEntity
export type CancelSubscriptionOutput = typeof CancelSubscriptionOutput.Type

export const cancelSubscriptionOperation = defineOperation({
  id: "creem.cancelSubscription",
  method: "POST",
  path: "/subscriptions/{id}/cancel",
  inputSchema: CancelSubscriptionInput,
  outputSchema: CancelSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["mode", "onExecute"]
})

/**
 * Cancel a subscription.
 */
export const cancelSubscription = (input: CancelSubscriptionInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(cancelSubscriptionOperation, input)))
