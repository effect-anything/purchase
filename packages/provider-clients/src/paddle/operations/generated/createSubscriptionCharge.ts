import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const CreateSubscriptionChargeInput = Schema.Struct({
  subscription_id: Schema.String,
  effective_from: Models.EffectiveFrom,
  items: Schema.Array(Models.SubscriptionChargeItems),
  on_payment_failure: Schema.optional(Models.SubscriptionOnPaymentFailure),
})
export type CreateSubscriptionChargeInput = typeof CreateSubscriptionChargeInput.Type

export const CreateSubscriptionChargeOutput = Schema.Struct({
  data: Models.Subscription,
  meta: Models.Meta,
})
export type CreateSubscriptionChargeOutput = typeof CreateSubscriptionChargeOutput.Type

export const createSubscriptionChargeOperation = defineOperation({
  id: "paddle.create-subscription-charge",
  method: "POST",
  path: "/subscriptions/{subscription_id}/charge",
  inputSchema: CreateSubscriptionChargeInput,
  outputSchema: CreateSubscriptionChargeOutput,
  status: [201],
  contentType: "json",
  pathParams: ["subscription_id"],
  bodyParams: ["effective_from", "items", "on_payment_failure"]
})

/**
 * Create a one-time charge for a subscription
 */
export const createSubscriptionCharge = (input: CreateSubscriptionChargeInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createSubscriptionChargeOperation, input)))
