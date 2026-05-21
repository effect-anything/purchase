import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersCustomerSourcesInput = Schema.Struct({
  customer: Schema.String,
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  object: Schema.optional(Schema.String),
  starting_after: Schema.optional(Schema.String)
})
export type GetCustomersCustomerSourcesInput = typeof GetCustomersCustomerSourcesInput.Type

export const GetCustomersCustomerSourcesOutput = Schema.Struct({
  data: Schema.Array(Models.PaymentSource),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String
})
export type GetCustomersCustomerSourcesOutput = typeof GetCustomersCustomerSourcesOutput.Type

export const getCustomersCustomerSourcesOperation = defineOperation({
  id: "stripe.GetCustomersCustomerSources",
  method: "GET",
  path: "/v1/customers/{customer}/sources",
  inputSchema: GetCustomersCustomerSourcesInput,
  outputSchema: GetCustomersCustomerSourcesOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["ending_before", "expand", "limit", "object", "starting_after"]
})

/**
 * <p>List sources for a specified customer.</p>
 */
export const getCustomersCustomerSources = (input: GetCustomersCustomerSourcesInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerSourcesOperation, input)))
