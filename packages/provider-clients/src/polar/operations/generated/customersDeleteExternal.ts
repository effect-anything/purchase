import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CustomersDeleteExternalInput = Schema.Struct({
  external_id: Schema.String,
  anonymize: Schema.optional(Schema.Boolean),
})
export type CustomersDeleteExternalInput = typeof CustomersDeleteExternalInput.Type

export const CustomersDeleteExternalOutput = Schema.Unknown
export type CustomersDeleteExternalOutput = typeof CustomersDeleteExternalOutput.Type

export const customersDeleteExternalOperation = defineOperation({
  id: "polar.customers:delete_external",
  method: "DELETE",
  path: "/v1/customers/external/{external_id}",
  inputSchema: CustomersDeleteExternalInput,
  outputSchema: CustomersDeleteExternalOutput,
  status: [204],
  contentType: "json",
  pathParams: ["external_id"],
  queryParams: ["anonymize"]
})

/**
 * Delete Customer by External ID
 */
export const customersDeleteExternal = (input: CustomersDeleteExternalInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersDeleteExternalOperation, input)))
