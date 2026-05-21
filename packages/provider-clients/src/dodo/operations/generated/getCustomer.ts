import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomerInput = Schema.Struct({
  customer_id: Schema.String
})
export type GetCustomerInput = typeof GetCustomerInput.Type

export const GetCustomerOutput = Models.Customer
export type GetCustomerOutput = typeof GetCustomerOutput.Type

export const getCustomerOperation = defineOperation({
  id: "dodo.getCustomer",
  method: "GET",
  path: "/customers/{customer_id}",
  inputSchema: GetCustomerInput,
  outputSchema: GetCustomerOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"]
})

/**
 * Get customer
 */
export const getCustomer = (input: GetCustomerInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getCustomerOperation, input)))
