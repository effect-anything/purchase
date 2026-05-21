import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListProductsInput = Schema.Struct({
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  include: Schema.optional(Schema.Array(Models.ProductIncludeEnum)),
  order_by: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Array(Models.StatusQuery)),
  tax_category: Schema.optional(Schema.Array(Models.TaxCategoryQueryEnum)),
  type: Schema.optional(Models.CatalogTypeQueryEnum)
})
export type ListProductsInput = typeof ListProductsInput.Type

export const ListProductsOutput = Schema.Struct({
  data: Schema.Array(Models.ProductIncludes),
  meta: Models.PaginatedMeta
})
export type ListProductsOutput = typeof ListProductsOutput.Type

export const listProductsOperation = defineOperation({
  id: "paddle.list-products",
  method: "GET",
  path: "/products",
  inputSchema: ListProductsInput,
  outputSchema: ListProductsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["id", "after", "per_page", "include", "order_by", "status", "tax_category", "type"]
})

/**
 * List products
 */
export const listProducts = (input: ListProductsInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listProductsOperation, input)))
