import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ListCustomersInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
})
export type ListCustomersInput = typeof ListCustomersInput.Type

export const ListCustomersOutput = Models.CustomerListResponse
export type ListCustomersOutput = typeof ListCustomersOutput.Type

export const listCustomersOperation = defineOperation({
  id: "dodo.listCustomers",
  method: "GET",
  path: "/customers",
  inputSchema: ListCustomersInput,
  outputSchema: ListCustomersOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size"]
})

/**
 * List customers
 */
export const listCustomers = (input: ListCustomersInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listCustomersOperation, input)))
