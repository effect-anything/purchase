import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const PauseSubscriptionInput = Schema.Struct({
  id: Schema.String,
})
export type PauseSubscriptionInput = typeof PauseSubscriptionInput.Type

export const PauseSubscriptionOutput = Models.SubscriptionEntity
export type PauseSubscriptionOutput = typeof PauseSubscriptionOutput.Type

export const pauseSubscriptionOperation = defineOperation({
  id: "creem.pauseSubscription",
  method: "POST",
  path: "/subscriptions/{id}/pause",
  inputSchema: PauseSubscriptionInput,
  outputSchema: PauseSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Pause a subscription.
 */
export const pauseSubscription = (input: PauseSubscriptionInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(pauseSubscriptionOperation, input)))
