import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ResumeSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String
})
export type ResumeSubscriptionInput = typeof ResumeSubscriptionInput.Type

export const ResumeSubscriptionOutput = Schema.Struct({
  data: Models.Subscription,
  meta: Models.Meta
})
export type ResumeSubscriptionOutput = typeof ResumeSubscriptionOutput.Type

export const resumeSubscriptionOperation = defineOperation({
  id: "paddle.resume-subscription",
  method: "POST",
  path: "/subscriptions/{subscription_id}/resume",
  inputSchema: ResumeSubscriptionInput,
  outputSchema: ResumeSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"]
})

/**
 * Resume a paused subscription
 */
export const resumeSubscription = (input: ResumeSubscriptionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(resumeSubscriptionOperation, input)))
