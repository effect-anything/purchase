import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateCustomerInput = Schema.Struct({
  email: Schema.String,
  name: Schema.String,
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})
export type CreateCustomerInput = typeof CreateCustomerInput.Type

export const CreateCustomerOutput = Models.CustomerEntity
export type CreateCustomerOutput = typeof CreateCustomerOutput.Type

export const createCustomerOperation = defineOperation({
  id: "creem.createCustomer",
  method: "POST",
  path: "/customers",
  inputSchema: CreateCustomerInput,
  outputSchema: CreateCustomerOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["email", "name", "metadata"]
})

/**
 * Create a customer
 */
export const createCustomer = (input: CreateCustomerInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(createCustomerOperation, input)))
