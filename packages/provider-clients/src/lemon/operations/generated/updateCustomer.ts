import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const UpdateCustomerInput = Schema.Struct({
  id: Schema.String,
  data: Models.CustomerUpdateData,
})
export type UpdateCustomerInput = typeof UpdateCustomerInput.Type

export const UpdateCustomerOutput = Models.CustomerResponse
export type UpdateCustomerOutput = typeof UpdateCustomerOutput.Type

export const updateCustomerOperation = defineOperation({
  id: "lemon.updateCustomer",
  method: "PATCH",
  path: "/customers/{id}",
  inputSchema: UpdateCustomerInput,
  outputSchema: UpdateCustomerOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["data"]
})

/**
 * Update customer
 */
export const updateCustomer = (input: UpdateCustomerInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(updateCustomerOperation, input)))
