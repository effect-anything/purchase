import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const DeleteCustomersCustomerInput = Schema.Struct({
  customer: Schema.String,
})
export type DeleteCustomersCustomerInput = typeof DeleteCustomersCustomerInput.Type

export const DeleteCustomersCustomerOutput = Models.DeletedCustomer
export type DeleteCustomersCustomerOutput = typeof DeleteCustomersCustomerOutput.Type

export const deleteCustomersCustomerOperation = defineOperation({
  id: "stripe.DeleteCustomersCustomer",
  method: "DELETE",
  path: "/v1/customers/{customer}",
  inputSchema: DeleteCustomersCustomerInput,
  outputSchema: DeleteCustomersCustomerOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"]
})

/**
 * Delete a customer
 */
export const deleteCustomersCustomer = (input: DeleteCustomersCustomerInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(deleteCustomersCustomerOperation, input)))
