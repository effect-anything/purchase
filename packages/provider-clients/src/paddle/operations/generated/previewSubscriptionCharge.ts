import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PreviewSubscriptionChargeInput = Schema.Struct({
  subscription_id: Schema.String,
  effective_from: Models.EffectiveFrom,
  items: Schema.Array(Models.SubscriptionChargeItems),
  on_payment_failure: Schema.optional(Models.SubscriptionOnPaymentFailure)
})
export type PreviewSubscriptionChargeInput = typeof PreviewSubscriptionChargeInput.Type

export const PreviewSubscriptionChargeOutput = Schema.Struct({
  data: Models.SubscriptionPreview,
  meta: Models.Meta
})
export type PreviewSubscriptionChargeOutput = typeof PreviewSubscriptionChargeOutput.Type

export const previewSubscriptionChargeOperation = defineOperation({
  id: "paddle.preview-subscription-charge",
  method: "POST",
  path: "/subscriptions/{subscription_id}/charge/preview",
  inputSchema: PreviewSubscriptionChargeInput,
  outputSchema: PreviewSubscriptionChargeOutput,
  status: [200],
  contentType: "json",
  pathParams: ["subscription_id"],
  bodyParams: ["effective_from", "items", "on_payment_failure"]
})

/**
 * Preview a one-time charge for a subscription
 */
export const previewSubscriptionCharge = (input: PreviewSubscriptionChargeInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(previewSubscriptionChargeOperation, input)))
