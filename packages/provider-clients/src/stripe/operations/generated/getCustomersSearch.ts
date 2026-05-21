import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersSearchInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  page: Schema.optional(Schema.String),
  query: Schema.String
})
export type GetCustomersSearchInput = typeof GetCustomersSearchInput.Type

export const GetCustomersSearchOutput = Schema.Struct({
  data: Schema.Array(Models.Customer),
  has_more: Schema.Boolean,
  next_page: Schema.NullOr(Schema.String),
  object: Schema.Literal("search_result"),
  total_count: Schema.optional(Schema.Number),
  url: Schema.String
})
export type GetCustomersSearchOutput = typeof GetCustomersSearchOutput.Type

export const getCustomersSearchOperation = defineOperation({
  id: "stripe.GetCustomersSearch",
  method: "GET",
  path: "/v1/customers/search",
  inputSchema: GetCustomersSearchInput,
  outputSchema: GetCustomersSearchOutput,
  status: [200],
  contentType: "form",
  queryParams: ["expand", "limit", "page", "query"]
})

/**
 * Search customers
 */
export const getCustomersSearch = (input: GetCustomersSearchInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersSearchOperation, input)))
