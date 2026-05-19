import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const DeleteCustomersCustomerTaxIdsIdInput = Schema.Struct({
  customer: Schema.String,
  id: Schema.String,
})
export type DeleteCustomersCustomerTaxIdsIdInput = typeof DeleteCustomersCustomerTaxIdsIdInput.Type

export const DeleteCustomersCustomerTaxIdsIdOutput = Models.DeletedTaxId
export type DeleteCustomersCustomerTaxIdsIdOutput = typeof DeleteCustomersCustomerTaxIdsIdOutput.Type

export const deleteCustomersCustomerTaxIdsIdOperation = defineOperation({
  id: "stripe.DeleteCustomersCustomerTaxIdsId",
  method: "DELETE",
  path: "/v1/customers/{customer}/tax_ids/{id}",
  inputSchema: DeleteCustomersCustomerTaxIdsIdInput,
  outputSchema: DeleteCustomersCustomerTaxIdsIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "id"]
})

/**
 * Delete a Customer tax ID
 */
export const deleteCustomersCustomerTaxIdsId = (input: DeleteCustomersCustomerTaxIdsIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(deleteCustomersCustomerTaxIdsIdOperation, input)))
