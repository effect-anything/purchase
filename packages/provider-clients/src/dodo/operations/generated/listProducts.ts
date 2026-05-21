import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListProductsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number)
})
export type ListProductsInput = typeof ListProductsInput.Type

export const ListProductsOutput = Models.ProductListResponse
export type ListProductsOutput = typeof ListProductsOutput.Type

export const listProductsOperation = defineOperation({
  id: "dodo.listProducts",
  method: "GET",
  path: "/products",
  inputSchema: ListProductsInput,
  outputSchema: ListProductsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size"]
})

/**
 * List products
 */
export const listProducts = (input: ListProductsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listProductsOperation, input)))
