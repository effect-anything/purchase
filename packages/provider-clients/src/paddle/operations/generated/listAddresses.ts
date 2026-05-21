import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListAddressesInput = Schema.Struct({
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  order_by: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Array(Models.StatusQuery)),
  search: Schema.optional(Schema.String),
  customer_id: Schema.String
})
export type ListAddressesInput = typeof ListAddressesInput.Type

export const ListAddressesOutput = Schema.Struct({
  data: Schema.Array(Models.Address),
  meta: Models.PaginatedMeta
})
export type ListAddressesOutput = typeof ListAddressesOutput.Type

export const listAddressesOperation = defineOperation({
  id: "paddle.list-addresses",
  method: "GET",
  path: "/customers/{customer_id}/addresses",
  inputSchema: ListAddressesInput,
  outputSchema: ListAddressesOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"],
  queryParams: ["id", "after", "per_page", "order_by", "status", "search"]
})

/**
 * List addresses for a customer
 */
export const listAddresses = (input: ListAddressesInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listAddressesOperation, input)))
