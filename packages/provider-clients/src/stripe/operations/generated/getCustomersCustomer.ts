import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersCustomerInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String))
})
export type GetCustomersCustomerInput = typeof GetCustomersCustomerInput.Type

export const GetCustomersCustomerOutput = Schema.Union(Models.Customer, Models.DeletedCustomer)
export type GetCustomersCustomerOutput = typeof GetCustomersCustomerOutput.Type

export const getCustomersCustomerOperation = defineOperation({
  id: "stripe.GetCustomersCustomer",
  method: "GET",
  path: "/v1/customers/{customer}",
  inputSchema: GetCustomersCustomerInput,
  outputSchema: GetCustomersCustomerOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["expand"]
})

/**
 * Retrieve a customer
 */
export const getCustomersCustomer = (input: GetCustomersCustomerInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerOperation, input)))
