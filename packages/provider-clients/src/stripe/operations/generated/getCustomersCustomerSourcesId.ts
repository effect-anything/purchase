import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCustomersCustomerSourcesIdInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  id: Schema.String,
})
export type GetCustomersCustomerSourcesIdInput = typeof GetCustomersCustomerSourcesIdInput.Type

export const GetCustomersCustomerSourcesIdOutput = Models.PaymentSource
export type GetCustomersCustomerSourcesIdOutput = typeof GetCustomersCustomerSourcesIdOutput.Type

export const getCustomersCustomerSourcesIdOperation = defineOperation({
  id: "stripe.GetCustomersCustomerSourcesId",
  method: "GET",
  path: "/v1/customers/{customer}/sources/{id}",
  inputSchema: GetCustomersCustomerSourcesIdInput,
  outputSchema: GetCustomersCustomerSourcesIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "id"],
  queryParams: ["expand"]
})

/**
 * <p>Retrieve a specified source for a given customer.</p>
 */
export const getCustomersCustomerSourcesId = (input: GetCustomersCustomerSourcesIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerSourcesIdOperation, input)))
