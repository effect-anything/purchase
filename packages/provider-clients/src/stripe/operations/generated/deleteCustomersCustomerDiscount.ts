import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const DeleteCustomersCustomerDiscountInput = Schema.Struct({
  customer: Schema.String,
})
export type DeleteCustomersCustomerDiscountInput = typeof DeleteCustomersCustomerDiscountInput.Type

export const DeleteCustomersCustomerDiscountOutput = Models.DeletedDiscount
export type DeleteCustomersCustomerDiscountOutput = typeof DeleteCustomersCustomerDiscountOutput.Type

export const deleteCustomersCustomerDiscountOperation = defineOperation({
  id: "stripe.DeleteCustomersCustomerDiscount",
  method: "DELETE",
  path: "/v1/customers/{customer}/discount",
  inputSchema: DeleteCustomersCustomerDiscountInput,
  outputSchema: DeleteCustomersCustomerDiscountOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"]
})

/**
 * Delete a customer discount
 */
export const deleteCustomersCustomerDiscount = (input: DeleteCustomersCustomerDiscountInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(deleteCustomersCustomerDiscountOperation, input)))
