import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ResumeSubscriptionInput = Schema.Struct({
  id: Schema.String
})
export type ResumeSubscriptionInput = typeof ResumeSubscriptionInput.Type

export const ResumeSubscriptionOutput = Models.SubscriptionEntity
export type ResumeSubscriptionOutput = typeof ResumeSubscriptionOutput.Type

export const resumeSubscriptionOperation = defineOperation({
  id: "creem.resumeSubscription",
  method: "POST",
  path: "/subscriptions/{id}/resume",
  inputSchema: ResumeSubscriptionInput,
  outputSchema: ResumeSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Resume a subscription.
 */
export const resumeSubscription = (input: ResumeSubscriptionInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(resumeSubscriptionOperation, input)))
