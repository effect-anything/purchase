import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const ListBusinessesInput = Schema.Struct({
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  order_by: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Array(Models.StatusQuery)),
  search: Schema.optional(Schema.String),
  customer_id: Schema.String,
})
export type ListBusinessesInput = typeof ListBusinessesInput.Type

export const ListBusinessesOutput = Schema.Struct({
  data: Schema.Array(Models.Business),
  meta: Models.PaginatedMeta,
})
export type ListBusinessesOutput = typeof ListBusinessesOutput.Type

export const listBusinessesOperation = defineOperation({
  id: "paddle.list-businesses",
  method: "GET",
  path: "/customers/{customer_id}/businesses",
  inputSchema: ListBusinessesInput,
  outputSchema: ListBusinessesOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"],
  queryParams: ["id", "after", "per_page", "order_by", "status", "search"]
})

/**
 * List businesses for a customer
 */
export const listBusinesses = (input: ListBusinessesInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listBusinessesOperation, input)))
