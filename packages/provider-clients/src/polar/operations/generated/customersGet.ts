import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CustomersGetInput = Schema.Struct({
  id: Schema.String,
})
export type CustomersGetInput = typeof CustomersGetInput.Type

export const CustomersGetOutput = Models.Customer
export type CustomersGetOutput = typeof CustomersGetOutput.Type

export const customersGetOperation = defineOperation({
  id: "polar.customers:get",
  method: "GET",
  path: "/v1/customers/{id}",
  inputSchema: CustomersGetInput,
  outputSchema: CustomersGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Customer
 */
export const customersGet = (input: CustomersGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersGetOperation, input)))
