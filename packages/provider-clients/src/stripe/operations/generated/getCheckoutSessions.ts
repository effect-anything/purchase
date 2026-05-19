import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCheckoutSessionsInput = Schema.Struct({
  created: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  customer: Schema.optional(Schema.String),
  customer_account: Schema.optional(Schema.String),
  customer_details: Schema.optional(Schema.Struct({
  email: Schema.String,
})),
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  payment_intent: Schema.optional(Schema.String),
  payment_link: Schema.optional(Schema.String),
  starting_after: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Literal("complete", "expired", "open")),
  subscription: Schema.optional(Schema.String),
})
export type GetCheckoutSessionsInput = typeof GetCheckoutSessionsInput.Type

export const GetCheckoutSessionsOutput = Schema.Struct({
  data: Schema.Array(Models.CheckoutSession),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetCheckoutSessionsOutput = typeof GetCheckoutSessionsOutput.Type

export const getCheckoutSessionsOperation = defineOperation({
  id: "stripe.GetCheckoutSessions",
  method: "GET",
  path: "/v1/checkout/sessions",
  inputSchema: GetCheckoutSessionsInput,
  outputSchema: GetCheckoutSessionsOutput,
  status: [200],
  contentType: "form",
  queryParams: ["created", "customer", "customer_account", "customer_details", "ending_before", "expand", "limit", "payment_intent", "payment_link", "starting_after", "status", "subscription"]
})

/**
 * List all Checkout Sessions
 */
export const getCheckoutSessions = (input: GetCheckoutSessionsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCheckoutSessionsOperation, input)))
