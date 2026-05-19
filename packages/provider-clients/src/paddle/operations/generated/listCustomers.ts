import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const ListCustomersInput = Schema.Struct({
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  email: Schema.optional(Schema.Array(Schema.String)),
  order_by: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Array(Models.StatusQuery)),
  search: Schema.optional(Schema.String),
})
export type ListCustomersInput = typeof ListCustomersInput.Type

export const ListCustomersOutput = Schema.Struct({
  data: Schema.Array(Models.Customer),
  meta: Models.PaginatedMeta,
})
export type ListCustomersOutput = typeof ListCustomersOutput.Type

export const listCustomersOperation = defineOperation({
  id: "paddle.list-customers",
  method: "GET",
  path: "/customers",
  inputSchema: ListCustomersInput,
  outputSchema: ListCustomersOutput,
  status: [200],
  contentType: "json",
  queryParams: ["id", "after", "per_page", "email", "order_by", "status", "search"]
})

/**
 * List customers
 */
export const listCustomers = (input: ListCustomersInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listCustomersOperation, input)))
