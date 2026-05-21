import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersCustomerPaymentMethodsPaymentMethodInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  payment_method: Schema.String
})
export type GetCustomersCustomerPaymentMethodsPaymentMethodInput =
  typeof GetCustomersCustomerPaymentMethodsPaymentMethodInput.Type

export const GetCustomersCustomerPaymentMethodsPaymentMethodOutput = Models.PaymentMethod
export type GetCustomersCustomerPaymentMethodsPaymentMethodOutput =
  typeof GetCustomersCustomerPaymentMethodsPaymentMethodOutput.Type

export const getCustomersCustomerPaymentMethodsPaymentMethodOperation = defineOperation({
  id: "stripe.GetCustomersCustomerPaymentMethodsPaymentMethod",
  method: "GET",
  path: "/v1/customers/{customer}/payment_methods/{payment_method}",
  inputSchema: GetCustomersCustomerPaymentMethodsPaymentMethodInput,
  outputSchema: GetCustomersCustomerPaymentMethodsPaymentMethodOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "payment_method"],
  queryParams: ["expand"]
})

/**
 * Retrieve a Customer's PaymentMethod
 */
export const getCustomersCustomerPaymentMethodsPaymentMethod = (
  input: GetCustomersCustomerPaymentMethodsPaymentMethodInput
) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(getCustomersCustomerPaymentMethodsPaymentMethodOperation, input))
  )
