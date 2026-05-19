import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCustomersCustomerBalanceTransactionsTransactionInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  transaction: Schema.String,
})
export type GetCustomersCustomerBalanceTransactionsTransactionInput = typeof GetCustomersCustomerBalanceTransactionsTransactionInput.Type

export const GetCustomersCustomerBalanceTransactionsTransactionOutput = Models.CustomerBalanceTransaction
export type GetCustomersCustomerBalanceTransactionsTransactionOutput = typeof GetCustomersCustomerBalanceTransactionsTransactionOutput.Type

export const getCustomersCustomerBalanceTransactionsTransactionOperation = defineOperation({
  id: "stripe.GetCustomersCustomerBalanceTransactionsTransaction",
  method: "GET",
  path: "/v1/customers/{customer}/balance_transactions/{transaction}",
  inputSchema: GetCustomersCustomerBalanceTransactionsTransactionInput,
  outputSchema: GetCustomersCustomerBalanceTransactionsTransactionOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "transaction"],
  queryParams: ["expand"]
})

/**
 * Retrieve a customer balance transaction
 */
export const getCustomersCustomerBalanceTransactionsTransaction = (input: GetCustomersCustomerBalanceTransactionsTransactionInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerBalanceTransactionsTransactionOperation, input)))
