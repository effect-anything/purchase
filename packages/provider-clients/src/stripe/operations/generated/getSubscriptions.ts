import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetSubscriptionsInput = Schema.Struct({
  automatic_tax: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
})),
  collection_method: Schema.optional(Schema.Literal("charge_automatically", "send_invoice")),
  created: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  current_period_end: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  current_period_start: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  customer: Schema.optional(Schema.String),
  customer_account: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  plan: Schema.optional(Schema.String),
  price: Schema.optional(Schema.String),
  starting_after: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Literal("active", "all", "canceled", "ended", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid")),
  test_clock: Schema.optional(Schema.String),
})
export type GetSubscriptionsInput = typeof GetSubscriptionsInput.Type

export const GetSubscriptionsOutput = Schema.Struct({
  data: Schema.Array(Models.Subscription),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetSubscriptionsOutput = typeof GetSubscriptionsOutput.Type

export const getSubscriptionsOperation = defineOperation({
  id: "stripe.GetSubscriptions",
  method: "GET",
  path: "/v1/subscriptions",
  inputSchema: GetSubscriptionsInput,
  outputSchema: GetSubscriptionsOutput,
  status: [200],
  contentType: "form",
  queryParams: ["automatic_tax", "collection_method", "created", "current_period_end", "current_period_start", "customer", "customer_account", "ending_before", "expand", "limit", "plan", "price", "starting_after", "status", "test_clock"]
})

/**
 * List subscriptions
 */
export const getSubscriptions = (input: GetSubscriptionsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getSubscriptionsOperation, input)))
