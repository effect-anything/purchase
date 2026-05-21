import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCustomerPaymentMethodsInput = Schema.Struct({
  customer_id: Schema.String,
  after: Schema.optional(Schema.String),
  per_page: Schema.optional(Schema.Number),
  address_id: Schema.optional(Schema.Array(Schema.String)),
  order_by: Schema.optional(Schema.String),
  supports_checkout: Schema.optional(Schema.Boolean)
})
export type ListCustomerPaymentMethodsInput = typeof ListCustomerPaymentMethodsInput.Type

export const ListCustomerPaymentMethodsOutput = Schema.Struct({
  data: Schema.Array(Models.CustomerPaymentMethod),
  meta: Models.PaginatedMeta
})
export type ListCustomerPaymentMethodsOutput = typeof ListCustomerPaymentMethodsOutput.Type

export const listCustomerPaymentMethodsOperation = defineOperation({
  id: "paddle.list-customer-payment-methods",
  method: "GET",
  path: "/customers/{customer_id}/payment-methods",
  inputSchema: ListCustomerPaymentMethodsInput,
  outputSchema: ListCustomerPaymentMethodsOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"],
  queryParams: ["after", "per_page", "address_id", "order_by", "supports_checkout"]
})

/**
 * List payment methods for a customer
 */
export const listCustomerPaymentMethods = (input: ListCustomerPaymentMethodsInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listCustomerPaymentMethodsOperation, input)))
