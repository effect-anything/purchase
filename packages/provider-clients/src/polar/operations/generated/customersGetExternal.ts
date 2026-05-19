import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CustomersGetExternalInput = Schema.Struct({
  external_id: Schema.String,
})
export type CustomersGetExternalInput = typeof CustomersGetExternalInput.Type

export const CustomersGetExternalOutput = Models.Customer
export type CustomersGetExternalOutput = typeof CustomersGetExternalOutput.Type

export const customersGetExternalOperation = defineOperation({
  id: "polar.customers:get_external",
  method: "GET",
  path: "/v1/customers/external/{external_id}",
  inputSchema: CustomersGetExternalInput,
  outputSchema: CustomersGetExternalOutput,
  status: [200],
  contentType: "json",
  pathParams: ["external_id"]
})

/**
 * Get Customer by External ID
 */
export const customersGetExternal = (input: CustomersGetExternalInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersGetExternalOperation, input)))
