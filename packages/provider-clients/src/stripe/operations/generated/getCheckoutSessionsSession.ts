import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCheckoutSessionsSessionInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  session: Schema.String,
})
export type GetCheckoutSessionsSessionInput = typeof GetCheckoutSessionsSessionInput.Type

export const GetCheckoutSessionsSessionOutput = Models.CheckoutSession
export type GetCheckoutSessionsSessionOutput = typeof GetCheckoutSessionsSessionOutput.Type

export const getCheckoutSessionsSessionOperation = defineOperation({
  id: "stripe.GetCheckoutSessionsSession",
  method: "GET",
  path: "/v1/checkout/sessions/{session}",
  inputSchema: GetCheckoutSessionsSessionInput,
  outputSchema: GetCheckoutSessionsSessionOutput,
  status: [200],
  contentType: "form",
  pathParams: ["session"],
  queryParams: ["expand"]
})

/**
 * Retrieve a Checkout Session
 */
export const getCheckoutSessionsSession = (input: GetCheckoutSessionsSessionInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCheckoutSessionsSessionOperation, input)))
