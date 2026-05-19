import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const PauseSubscriptionInput = Schema.Struct({
  subscription_id: Schema.String,
  effective_from: Schema.optional(Schema.NullOr(Models.EffectiveFrom)),
  resume_at: Schema.optional(Schema.NullOr(Models.Timestamp)),
  on_resume: Schema.optional(Models.SubscriptionOnResume),
})
export type PauseSubscriptionInput = typeof PauseSubscriptionInput.Type

export const PauseSubscriptionOutput = Schema.Struct({
  data: Models.Subscription,
  meta: Models.Meta,
})
export type PauseSubscriptionOutput = typeof PauseSubscriptionOutput.Type

export const pauseSubscriptionOperation = defineOperation({
  id: "paddle.pause-subscription",
  method: "POST",
  path: "/subscriptions/{subscription_id}/pause",
  inputSchema: PauseSubscriptionInput,
  outputSchema: PauseSubscriptionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"],
  bodyParams: ["effective_from", "resume_at", "on_resume"]
})

/**
 * Pause a subscription
 */
export const pauseSubscription = (input: PauseSubscriptionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(pauseSubscriptionOperation, input)))
