import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CustomersGetStateExternalInput = Schema.Struct({
  external_id: Schema.String
})
export type CustomersGetStateExternalInput = typeof CustomersGetStateExternalInput.Type

export const CustomersGetStateExternalOutput = Models.CustomerState
export type CustomersGetStateExternalOutput = typeof CustomersGetStateExternalOutput.Type

export const customersGetStateExternalOperation = defineOperation({
  id: "polar.customers:get_state_external",
  method: "GET",
  path: "/v1/customers/external/{external_id}/state",
  inputSchema: CustomersGetStateExternalInput,
  outputSchema: CustomersGetStateExternalOutput,
  status: [200],
  contentType: "json",
  pathParams: ["external_id"]
})

/**
 * Get Customer State by External ID
 */
export const customersGetStateExternal = (input: CustomersGetStateExternalInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersGetStateExternalOperation, input)))
