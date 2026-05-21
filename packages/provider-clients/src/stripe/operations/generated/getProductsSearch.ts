import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetProductsSearchInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  page: Schema.optional(Schema.String),
  query: Schema.String
})
export type GetProductsSearchInput = typeof GetProductsSearchInput.Type

export const GetProductsSearchOutput = Schema.Struct({
  data: Schema.Array(Models.Product),
  has_more: Schema.Boolean,
  next_page: Schema.NullOr(Schema.String),
  object: Schema.Literal("search_result"),
  total_count: Schema.optional(Schema.Number),
  url: Schema.String
})
export type GetProductsSearchOutput = typeof GetProductsSearchOutput.Type

export const getProductsSearchOperation = defineOperation({
  id: "stripe.GetProductsSearch",
  method: "GET",
  path: "/v1/products/search",
  inputSchema: GetProductsSearchInput,
  outputSchema: GetProductsSearchOutput,
  status: [200],
  contentType: "form",
  queryParams: ["expand", "limit", "page", "query"]
})

/**
 * Search products
 */
export const getProductsSearch = (input: GetProductsSearchInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getProductsSearchOperation, input)))
