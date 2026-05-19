import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetPricesSearchInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  page: Schema.optional(Schema.String),
  query: Schema.String,
})
export type GetPricesSearchInput = typeof GetPricesSearchInput.Type

export const GetPricesSearchOutput = Schema.Struct({
  data: Schema.Array(Models.Price),
  has_more: Schema.Boolean,
  next_page: Schema.NullOr(Schema.String),
  object: Schema.Literal("search_result"),
  total_count: Schema.optional(Schema.Number),
  url: Schema.String,
})
export type GetPricesSearchOutput = typeof GetPricesSearchOutput.Type

export const getPricesSearchOperation = defineOperation({
  id: "stripe.GetPricesSearch",
  method: "GET",
  path: "/v1/prices/search",
  inputSchema: GetPricesSearchInput,
  outputSchema: GetPricesSearchOutput,
  status: [200],
  contentType: "form",
  queryParams: ["expand", "limit", "page", "query"]
})

/**
 * Search prices
 */
export const getPricesSearch = (input: GetPricesSearchInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getPricesSearchOperation, input)))
