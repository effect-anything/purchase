import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateCustomerInput = Schema.Struct({
  data: Models.CustomerCreateData
})
export type CreateCustomerInput = typeof CreateCustomerInput.Type

export const CreateCustomerOutput = Models.CustomerResponse
export type CreateCustomerOutput = typeof CreateCustomerOutput.Type

export const createCustomerOperation = defineOperation({
  id: "lemon.createCustomer",
  method: "POST",
  path: "/customers",
  inputSchema: CreateCustomerInput,
  outputSchema: CreateCustomerOutput,
  status: [201],
  contentType: "json",
  bodyParams: ["data"]
})

/**
 * Create customer
 */
export const createCustomer = (input: CreateCustomerInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(createCustomerOperation, input)))
