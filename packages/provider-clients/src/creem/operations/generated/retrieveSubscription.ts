import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const RetrieveSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String
})
export type RetrieveSubscriptionInput = typeof RetrieveSubscriptionInput.Type

export const RetrieveSubscriptionOutput = Models.SubscriptionEntity
export type RetrieveSubscriptionOutput = typeof RetrieveSubscriptionOutput.Type

export const retrieveSubscriptionOperation = defineOperation({
  id: "creem.retrieveSubscription",
  method: "GET",
  path: "/subscriptions",
  inputSchema: RetrieveSubscriptionInput,
  outputSchema: RetrieveSubscriptionOutput,
  status: [200],
  contentType: "json",
  queryParams: ["subscription_id"]
})

/**
 * Retrieve a subscription
 */
export const retrieveSubscription = (input: RetrieveSubscriptionInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(retrieveSubscriptionOperation, input)))
