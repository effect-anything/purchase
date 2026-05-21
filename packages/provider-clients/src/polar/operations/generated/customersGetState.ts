import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CustomersGetStateInput = Schema.Struct({
  id: Schema.String
})
export type CustomersGetStateInput = typeof CustomersGetStateInput.Type

export const CustomersGetStateOutput = Models.CustomerState
export type CustomersGetStateOutput = typeof CustomersGetStateOutput.Type

export const customersGetStateOperation = defineOperation({
  id: "polar.customers:get_state",
  method: "GET",
  path: "/v1/customers/{id}/state",
  inputSchema: CustomersGetStateInput,
  outputSchema: CustomersGetStateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Customer State
 */
export const customersGetState = (input: CustomersGetStateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersGetStateOperation, input)))
