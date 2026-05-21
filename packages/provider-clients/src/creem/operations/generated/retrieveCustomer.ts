import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const RetrieveCustomerInput = Schema.Struct({
  customer_id: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String)
})
export type RetrieveCustomerInput = typeof RetrieveCustomerInput.Type

export const RetrieveCustomerOutput = Models.CustomerEntity
export type RetrieveCustomerOutput = typeof RetrieveCustomerOutput.Type

export const retrieveCustomerOperation = defineOperation({
  id: "creem.retrieveCustomer",
  method: "GET",
  path: "/customers",
  inputSchema: RetrieveCustomerInput,
  outputSchema: RetrieveCustomerOutput,
  status: [200],
  contentType: "json",
  queryParams: ["customer_id", "email"]
})

/**
 * Retrieve a customer
 */
export const retrieveCustomer = (input: RetrieveCustomerInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(retrieveCustomerOperation, input)))
