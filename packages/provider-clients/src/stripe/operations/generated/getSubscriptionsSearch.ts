import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetSubscriptionsSearchInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  page: Schema.optional(Schema.String),
  query: Schema.String
})
export type GetSubscriptionsSearchInput = typeof GetSubscriptionsSearchInput.Type

export const GetSubscriptionsSearchOutput = Schema.Struct({
  data: Schema.Array(Models.Subscription),
  has_more: Schema.Boolean,
  next_page: Schema.NullOr(Schema.String),
  object: Schema.Literal("search_result"),
  total_count: Schema.optional(Schema.Number),
  url: Schema.String
})
export type GetSubscriptionsSearchOutput = typeof GetSubscriptionsSearchOutput.Type

export const getSubscriptionsSearchOperation = defineOperation({
  id: "stripe.GetSubscriptionsSearch",
  method: "GET",
  path: "/v1/subscriptions/search",
  inputSchema: GetSubscriptionsSearchInput,
  outputSchema: GetSubscriptionsSearchOutput,
  status: [200],
  contentType: "form",
  queryParams: ["expand", "limit", "page", "query"]
})

/**
 * Search subscriptions
 */
export const getSubscriptionsSearch = (input: GetSubscriptionsSearchInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getSubscriptionsSearchOperation, input)))
