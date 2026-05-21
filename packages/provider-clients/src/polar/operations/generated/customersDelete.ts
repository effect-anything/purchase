import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CustomersDeleteInput = Schema.Struct({
  id: Schema.String,
  anonymize: Schema.optional(Schema.Boolean)
})
export type CustomersDeleteInput = typeof CustomersDeleteInput.Type

export const CustomersDeleteOutput = Schema.Unknown
export type CustomersDeleteOutput = typeof CustomersDeleteOutput.Type

export const customersDeleteOperation = defineOperation({
  id: "polar.customers:delete",
  method: "DELETE",
  path: "/v1/customers/{id}",
  inputSchema: CustomersDeleteInput,
  outputSchema: CustomersDeleteOutput,
  status: [204],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["anonymize"]
})

/**
 * Delete Customer
 */
export const customersDelete = (input: CustomersDeleteInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(customersDeleteOperation, input)))
