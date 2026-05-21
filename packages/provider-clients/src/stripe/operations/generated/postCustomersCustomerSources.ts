import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostCustomersCustomerSourcesInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  source: Schema.String,
  validate: Schema.optional(Schema.Boolean)
})
export type PostCustomersCustomerSourcesInput = typeof PostCustomersCustomerSourcesInput.Type

export const PostCustomersCustomerSourcesOutput = Models.PaymentSource
export type PostCustomersCustomerSourcesOutput = typeof PostCustomersCustomerSourcesOutput.Type

export const postCustomersCustomerSourcesOperation = defineOperation({
  id: "stripe.PostCustomersCustomerSources",
  method: "POST",
  path: "/v1/customers/{customer}/sources",
  inputSchema: PostCustomersCustomerSourcesInput,
  outputSchema: PostCustomersCustomerSourcesOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  bodyParams: ["expand", "metadata", "source", "validate"]
})

/**
 * Create a card
 */
export const postCustomersCustomerSources = (input: PostCustomersCustomerSourcesInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersCustomerSourcesOperation, input)))
