import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCustomersCustomerTaxIdsInput = Schema.Struct({
  customer: Schema.String,
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
})
export type GetCustomersCustomerTaxIdsInput = typeof GetCustomersCustomerTaxIdsInput.Type

export const GetCustomersCustomerTaxIdsOutput = Schema.Struct({
  data: Schema.Array(Models.TaxId),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetCustomersCustomerTaxIdsOutput = typeof GetCustomersCustomerTaxIdsOutput.Type

export const getCustomersCustomerTaxIdsOperation = defineOperation({
  id: "stripe.GetCustomersCustomerTaxIds",
  method: "GET",
  path: "/v1/customers/{customer}/tax_ids",
  inputSchema: GetCustomersCustomerTaxIdsInput,
  outputSchema: GetCustomersCustomerTaxIdsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["ending_before", "expand", "limit", "starting_after"]
})

/**
 * List all Customer tax IDs
 */
export const getCustomersCustomerTaxIds = (input: GetCustomersCustomerTaxIdsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerTaxIdsOperation, input)))
