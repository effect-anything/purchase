import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateCustomerInput = Schema.Struct({
  customer_id: Schema.String,
  name: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})
export type UpdateCustomerInput = typeof UpdateCustomerInput.Type

export const UpdateCustomerOutput = Models.CustomerEntity
export type UpdateCustomerOutput = typeof UpdateCustomerOutput.Type

export const updateCustomerOperation = defineOperation({
  id: "creem.updateCustomer",
  method: "PATCH",
  path: "/customers",
  inputSchema: UpdateCustomerInput,
  outputSchema: UpdateCustomerOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["customer_id", "name", "metadata"]
})

/**
 * Update a customer
 */
export const updateCustomer = (input: UpdateCustomerInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(updateCustomerOperation, input)))
