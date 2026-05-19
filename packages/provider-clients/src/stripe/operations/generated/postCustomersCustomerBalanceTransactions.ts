import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostCustomersCustomerBalanceTransactionsInput = Schema.Struct({
  customer: Schema.String,
  amount: Schema.Number,
  currency: Schema.String,
  description: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))),
})
export type PostCustomersCustomerBalanceTransactionsInput = typeof PostCustomersCustomerBalanceTransactionsInput.Type

export const PostCustomersCustomerBalanceTransactionsOutput = Models.CustomerBalanceTransaction
export type PostCustomersCustomerBalanceTransactionsOutput = typeof PostCustomersCustomerBalanceTransactionsOutput.Type

export const postCustomersCustomerBalanceTransactionsOperation = defineOperation({
  id: "stripe.PostCustomersCustomerBalanceTransactions",
  method: "POST",
  path: "/v1/customers/{customer}/balance_transactions",
  inputSchema: PostCustomersCustomerBalanceTransactionsInput,
  outputSchema: PostCustomersCustomerBalanceTransactionsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  bodyParams: ["amount", "currency", "description", "expand", "metadata"]
})

/**
 * Create a customer balance transaction
 */
export const postCustomersCustomerBalanceTransactions = (input: PostCustomersCustomerBalanceTransactionsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersCustomerBalanceTransactionsOperation, input)))
