import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const SearchProductsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
})
export type SearchProductsInput = typeof SearchProductsInput.Type

export const SearchProductsOutput = Models.ProductListEntity
export type SearchProductsOutput = typeof SearchProductsOutput.Type

export const searchProductsOperation = defineOperation({
  id: "creem.searchProducts",
  method: "GET",
  path: "/products/search",
  inputSchema: SearchProductsInput,
  outputSchema: SearchProductsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size"]
})

/**
 * List all products
 */
export const searchProducts = (input: SearchProductsInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(searchProductsOperation, input)))
