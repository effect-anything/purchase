import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomerInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String)
})
export type GetCustomerInput = typeof GetCustomerInput.Type

export const GetCustomerOutput = Models.CustomerResponse
export type GetCustomerOutput = typeof GetCustomerOutput.Type

export const getCustomerOperation = defineOperation({
  id: "lemon.getCustomer",
  method: "GET",
  path: "/customers/{id}",
  inputSchema: GetCustomerInput,
  outputSchema: GetCustomerOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get customer
 */
export const getCustomer = (input: GetCustomerInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getCustomerOperation, input)))
