import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateSubscriptionInput = Schema.Struct({
  id: Schema.String,
  items: Schema.optional(Schema.Array(Models.UpsertSubscriptionItemEntity)),
  update_behavior: Schema.optional(Schema.Literal("proration-charge-immediately", "proration-charge", "proration-none"))
})
export type UpdateSubscriptionInput = typeof UpdateSubscriptionInput.Type

export const UpdateSubscriptionOutput = Models.SubscriptionEntity
export type UpdateSubscriptionOutput = typeof UpdateSubscriptionOutput.Type

export const updateSubscriptionOperation = defineOperation({
  id: "creem.updateSubscription",
  method: "POST",
  path: "/subscriptions/{id}",
  inputSchema: UpdateSubscriptionInput,
  outputSchema: UpdateSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["items", "update_behavior"]
})

/**
 * Update a subscription.
 */
export const updateSubscription = (input: UpdateSubscriptionInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(updateSubscriptionOperation, input)))
