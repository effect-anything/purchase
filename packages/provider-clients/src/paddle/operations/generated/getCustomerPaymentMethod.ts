import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const GetCustomerPaymentMethodInput = Schema.Struct({
  customer_id: Schema.String,
  payment_method_id: Schema.String,
})
export type GetCustomerPaymentMethodInput = typeof GetCustomerPaymentMethodInput.Type

export const GetCustomerPaymentMethodOutput = Schema.Struct({
  data: Models.CustomerPaymentMethod,
  meta: Models.Meta,
})
export type GetCustomerPaymentMethodOutput = typeof GetCustomerPaymentMethodOutput.Type

export const getCustomerPaymentMethodOperation = defineOperation({
  id: "paddle.get-customer-payment-method",
  method: "GET",
  path: "/customers/{customer_id}/payment-methods/{payment_method_id}",
  inputSchema: GetCustomerPaymentMethodInput,
  outputSchema: GetCustomerPaymentMethodOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id", "payment_method_id"]
})

/**
 * Get a payment method for a customer
 */
export const getCustomerPaymentMethod = (input: GetCustomerPaymentMethodInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getCustomerPaymentMethodOperation, input)))
