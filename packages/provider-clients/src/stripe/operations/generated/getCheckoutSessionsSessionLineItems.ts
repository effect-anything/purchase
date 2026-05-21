import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCheckoutSessionsSessionLineItemsInput = Schema.Struct({
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  session: Schema.String,
  starting_after: Schema.optional(Schema.String)
})
export type GetCheckoutSessionsSessionLineItemsInput = typeof GetCheckoutSessionsSessionLineItemsInput.Type

export const GetCheckoutSessionsSessionLineItemsOutput = Schema.Struct({
  data: Schema.Array(Models.Item),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String
})
export type GetCheckoutSessionsSessionLineItemsOutput = typeof GetCheckoutSessionsSessionLineItemsOutput.Type

export const getCheckoutSessionsSessionLineItemsOperation = defineOperation({
  id: "stripe.GetCheckoutSessionsSessionLineItems",
  method: "GET",
  path: "/v1/checkout/sessions/{session}/line_items",
  inputSchema: GetCheckoutSessionsSessionLineItemsInput,
  outputSchema: GetCheckoutSessionsSessionLineItemsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["session"],
  queryParams: ["ending_before", "expand", "limit", "starting_after"]
})

/**
 * Retrieve a Checkout Session's line items
 */
export const getCheckoutSessionsSessionLineItems = (input: GetCheckoutSessionsSessionLineItemsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCheckoutSessionsSessionLineItemsOperation, input)))
