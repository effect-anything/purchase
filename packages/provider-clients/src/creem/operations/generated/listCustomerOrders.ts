import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const ListCustomerOrdersInput = Schema.Struct({
  id: Schema.String,
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
})
export type ListCustomerOrdersInput = typeof ListCustomerOrdersInput.Type

export const ListCustomerOrdersOutput = Models.OrderListEntity
export type ListCustomerOrdersOutput = typeof ListCustomerOrdersOutput.Type

export const listCustomerOrdersOperation = defineOperation({
  id: "creem.listCustomerOrders",
  method: "GET",
  path: "/customers/{id}/orders",
  inputSchema: ListCustomerOrdersInput,
  outputSchema: ListCustomerOrdersOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["page_number", "page_size"]
})

/**
 * List customer orders
 */
export const listCustomerOrders = (input: ListCustomerOrdersInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(listCustomerOrdersOperation, input)))
