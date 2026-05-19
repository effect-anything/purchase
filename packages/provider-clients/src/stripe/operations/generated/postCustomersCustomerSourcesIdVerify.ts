import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostCustomersCustomerSourcesIdVerifyInput = Schema.Struct({
  customer: Schema.String,
  id: Schema.String,
  amounts: Schema.optional(Schema.Array(Schema.Number)),
  expand: Schema.optional(Schema.Array(Schema.String)),
})
export type PostCustomersCustomerSourcesIdVerifyInput = typeof PostCustomersCustomerSourcesIdVerifyInput.Type

export const PostCustomersCustomerSourcesIdVerifyOutput = Models.BankAccount
export type PostCustomersCustomerSourcesIdVerifyOutput = typeof PostCustomersCustomerSourcesIdVerifyOutput.Type

export const postCustomersCustomerSourcesIdVerifyOperation = defineOperation({
  id: "stripe.PostCustomersCustomerSourcesIdVerify",
  method: "POST",
  path: "/v1/customers/{customer}/sources/{id}/verify",
  inputSchema: PostCustomersCustomerSourcesIdVerifyInput,
  outputSchema: PostCustomersCustomerSourcesIdVerifyOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "id"],
  bodyParams: ["amounts", "expand"]
})

/**
 * Verify a bank account
 */
export const postCustomersCustomerSourcesIdVerify = (input: PostCustomersCustomerSourcesIdVerifyInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersCustomerSourcesIdVerifyOperation, input)))
