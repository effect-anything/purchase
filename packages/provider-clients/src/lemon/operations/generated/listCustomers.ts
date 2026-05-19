import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const ListCustomersInput = Schema.Struct({
  "page[number]": Schema.optional(Schema.Number),
  "page[size]": Schema.optional(Schema.Number),
  "filter[store_id]": Schema.optional(Schema.String),
  "filter[email]": Schema.optional(Schema.String),
  include: Schema.optional(Schema.String),
})
export type ListCustomersInput = typeof ListCustomersInput.Type

export const ListCustomersOutput = Models.CustomerListResponse
export type ListCustomersOutput = typeof ListCustomersOutput.Type

export const listCustomersOperation = defineOperation({
  id: "lemon.listCustomers",
  method: "GET",
  path: "/customers",
  inputSchema: ListCustomersInput,
  outputSchema: ListCustomersOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page[number]", "page[size]", "filter[store_id]", "filter[email]", "include"]
})

/**
 * List customers
 */
export const listCustomers = (input: ListCustomersInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(listCustomersOperation, input)))
