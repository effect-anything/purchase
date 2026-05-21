import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostCustomersCustomerBalanceTransactionsTransactionInput = Schema.Struct({
  customer: Schema.String,
  transaction: Schema.String,
  description: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(
    Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))
  )
})
export type PostCustomersCustomerBalanceTransactionsTransactionInput =
  typeof PostCustomersCustomerBalanceTransactionsTransactionInput.Type

export const PostCustomersCustomerBalanceTransactionsTransactionOutput = Models.CustomerBalanceTransaction
export type PostCustomersCustomerBalanceTransactionsTransactionOutput =
  typeof PostCustomersCustomerBalanceTransactionsTransactionOutput.Type

export const postCustomersCustomerBalanceTransactionsTransactionOperation = defineOperation({
  id: "stripe.PostCustomersCustomerBalanceTransactionsTransaction",
  method: "POST",
  path: "/v1/customers/{customer}/balance_transactions/{transaction}",
  inputSchema: PostCustomersCustomerBalanceTransactionsTransactionInput,
  outputSchema: PostCustomersCustomerBalanceTransactionsTransactionOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "transaction"],
  bodyParams: ["description", "expand", "metadata"]
})

/**
 * Update a customer credit balance transaction
 */
export const postCustomersCustomerBalanceTransactionsTransaction = (
  input: PostCustomersCustomerBalanceTransactionsTransactionInput
) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(postCustomersCustomerBalanceTransactionsTransactionOperation, input))
  )
