import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListPricesInput = Schema.Struct({
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  include: Schema.optional(Schema.Array(Models.PriceIncludeEnum)),
  order_by: Schema.optional(Schema.String),
  product_id: Schema.optional(Schema.Array(Schema.String)),
  status: Schema.optional(Schema.Array(Models.StatusQuery)),
  recurring: Schema.optional(Schema.Boolean),
  type: Schema.optional(Models.CatalogTypeQueryEnum)
})
export type ListPricesInput = typeof ListPricesInput.Type

export const ListPricesOutput = Schema.Struct({
  data: Schema.Array(Models.PriceIncludes),
  meta: Models.PaginatedMeta
})
export type ListPricesOutput = typeof ListPricesOutput.Type

export const listPricesOperation = defineOperation({
  id: "paddle.list-prices",
  method: "GET",
  path: "/prices",
  inputSchema: ListPricesInput,
  outputSchema: ListPricesOutput,
  status: [200],
  contentType: "json",
  queryParams: ["id", "after", "per_page", "include", "order_by", "product_id", "status", "recurring", "type"]
})

/**
 * List prices
 */
export const listPrices = (input: ListPricesInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listPricesOperation, input)))
