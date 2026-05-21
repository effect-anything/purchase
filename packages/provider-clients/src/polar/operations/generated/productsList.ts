import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ProductsListInput = Schema.Struct({
  id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  query: Schema.optional(Schema.NullOr(Schema.String)),
  is_archived: Schema.optional(Schema.NullOr(Schema.Boolean)),
  is_recurring: Schema.optional(Schema.NullOr(Schema.Boolean)),
  benefit_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  visibility: Schema.optional(Schema.NullOr(Schema.Array(Models.ProductVisibility))),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.ProductSortProperty))),
  metadata: Schema.optional(Models.MetadataQuery)
})
export type ProductsListInput = typeof ProductsListInput.Type

export const ProductsListOutput = Models.ListResourceProduct
export type ProductsListOutput = typeof ProductsListOutput.Type

export const productsListOperation = defineOperation({
  id: "polar.products:list",
  method: "GET",
  path: "/v1/products/",
  inputSchema: ProductsListInput,
  outputSchema: ProductsListOutput,
  status: [200],
  contentType: "json",
  queryParams: [
    "id",
    "organization_id",
    "query",
    "is_archived",
    "is_recurring",
    "benefit_id",
    "visibility",
    "page",
    "limit",
    "sorting",
    "metadata"
  ]
})

/**
 * List Products
 */
export const productsList = (input: ProductsListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(productsListOperation, input)))
