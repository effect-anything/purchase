import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListOrdersInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[store_id]": Schema.optional(Schema.String),
  "filter[user_email]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String)
})
export type ListOrdersInput = typeof ListOrdersInput.Type

export const ListOrdersOutput = Models.OrderListResponse
export type ListOrdersOutput = typeof ListOrdersOutput.Type

export const listOrdersOperation = defineOperation({
  id: "lemon.listOrders",
  method: "GET",
  path: "/orders",
  inputSchema: ListOrdersInput,
  outputSchema: ListOrdersOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[store_id]", "filter[user_email]", "include"]
})

/**
 * List orders
 */
export const listOrders = (input: ListOrdersInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listOrdersOperation, input)))
