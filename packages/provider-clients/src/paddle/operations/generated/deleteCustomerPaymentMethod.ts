import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const DeleteCustomerPaymentMethodInput = Schema.Struct({
  customer_id: Schema.String,
  payment_method_id: Schema.String
})
export type DeleteCustomerPaymentMethodInput = typeof DeleteCustomerPaymentMethodInput.Type

export const DeleteCustomerPaymentMethodOutput = Schema.Unknown
export type DeleteCustomerPaymentMethodOutput = typeof DeleteCustomerPaymentMethodOutput.Type

export const deleteCustomerPaymentMethodOperation = defineOperation({
  id: "paddle.delete-customer-payment-method",
  method: "DELETE",
  path: "/customers/{customer_id}/payment-methods/{payment_method_id}",
  inputSchema: DeleteCustomerPaymentMethodInput,
  outputSchema: DeleteCustomerPaymentMethodOutput,
  status: [204],
  contentType: "json",
  pathParams: ["customer_id", "payment_method_id"]
})

/**
 * Delete a payment method for a customer
 */
export const deleteCustomerPaymentMethod = (input: DeleteCustomerPaymentMethodInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(deleteCustomerPaymentMethodOperation, input)))
