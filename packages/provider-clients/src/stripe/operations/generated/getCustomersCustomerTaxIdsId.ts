import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersCustomerTaxIdsIdInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  id: Schema.String
})
export type GetCustomersCustomerTaxIdsIdInput = typeof GetCustomersCustomerTaxIdsIdInput.Type

export const GetCustomersCustomerTaxIdsIdOutput = Models.TaxId
export type GetCustomersCustomerTaxIdsIdOutput = typeof GetCustomersCustomerTaxIdsIdOutput.Type

export const getCustomersCustomerTaxIdsIdOperation = defineOperation({
  id: "stripe.GetCustomersCustomerTaxIdsId",
  method: "GET",
  path: "/v1/customers/{customer}/tax_ids/{id}",
  inputSchema: GetCustomersCustomerTaxIdsIdInput,
  outputSchema: GetCustomersCustomerTaxIdsIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "id"],
  queryParams: ["expand"]
})

/**
 * Retrieve a Customer tax ID
 */
export const getCustomersCustomerTaxIdsId = (input: GetCustomersCustomerTaxIdsIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerTaxIdsIdOperation, input)))
