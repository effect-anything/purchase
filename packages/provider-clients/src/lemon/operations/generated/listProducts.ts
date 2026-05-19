import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const ListProductsInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[store_id]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String),
})
export type ListProductsInput = typeof ListProductsInput.Type

export const ListProductsOutput = Models.ProductListResponse
export type ListProductsOutput = typeof ListProductsOutput.Type

export const listProductsOperation = defineOperation({
  id: "lemon.listProducts",
  method: "GET",
  path: "/products",
  inputSchema: ListProductsInput,
  outputSchema: ListProductsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[store_id]", "include"]
})

/**
 * List products
 */
export const listProducts = (input: ListProductsInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listProductsOperation, input)))
