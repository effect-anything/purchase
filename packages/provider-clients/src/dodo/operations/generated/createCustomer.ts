import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateCustomerInput = Schema.Struct({
  email: Schema.String,
  name: Schema.String,
  phone_number: Schema.optional(Schema.String),
  metadata: Schema.optional(Models.Metadata)
})
export type CreateCustomerInput = typeof CreateCustomerInput.Type

export const CreateCustomerOutput = Models.Customer
export type CreateCustomerOutput = typeof CreateCustomerOutput.Type

export const createCustomerOperation = defineOperation({
  id: "dodo.createCustomer",
  method: "POST",
  path: "/customers",
  inputSchema: CreateCustomerInput,
  outputSchema: CreateCustomerOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["email", "name", "phone_number", "metadata"]
})

/**
 * Create customer
 */
export const createCustomer = (input: CreateCustomerInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createCustomerOperation, input)))
