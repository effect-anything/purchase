import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostCheckoutSessionsSessionExpireInput = Schema.Struct({
  session: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
})
export type PostCheckoutSessionsSessionExpireInput = typeof PostCheckoutSessionsSessionExpireInput.Type

export const PostCheckoutSessionsSessionExpireOutput = Models.CheckoutSession
export type PostCheckoutSessionsSessionExpireOutput = typeof PostCheckoutSessionsSessionExpireOutput.Type

export const postCheckoutSessionsSessionExpireOperation = defineOperation({
  id: "stripe.PostCheckoutSessionsSessionExpire",
  method: "POST",
  path: "/v1/checkout/sessions/{session}/expire",
  inputSchema: PostCheckoutSessionsSessionExpireInput,
  outputSchema: PostCheckoutSessionsSessionExpireOutput,
  status: [200],
  contentType: "form",
  pathParams: ["session"],
  bodyParams: ["expand"]
})

/**
 * Expire a Checkout Session
 */
export const postCheckoutSessionsSessionExpire = (input: PostCheckoutSessionsSessionExpireInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCheckoutSessionsSessionExpireOperation, input)))
