import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersCustomerCashBalanceTransactionsTransactionInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  transaction: Schema.String
})
export type GetCustomersCustomerCashBalanceTransactionsTransactionInput =
  typeof GetCustomersCustomerCashBalanceTransactionsTransactionInput.Type

export const GetCustomersCustomerCashBalanceTransactionsTransactionOutput = Models.CustomerCashBalanceTransaction
export type GetCustomersCustomerCashBalanceTransactionsTransactionOutput =
  typeof GetCustomersCustomerCashBalanceTransactionsTransactionOutput.Type

export const getCustomersCustomerCashBalanceTransactionsTransactionOperation = defineOperation({
  id: "stripe.GetCustomersCustomerCashBalanceTransactionsTransaction",
  method: "GET",
  path: "/v1/customers/{customer}/cash_balance_transactions/{transaction}",
  inputSchema: GetCustomersCustomerCashBalanceTransactionsTransactionInput,
  outputSchema: GetCustomersCustomerCashBalanceTransactionsTransactionOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer", "transaction"],
  queryParams: ["expand"]
})

/**
 * Retrieve a cash balance transaction
 */
export const getCustomersCustomerCashBalanceTransactionsTransaction = (
  input: GetCustomersCustomerCashBalanceTransactionsTransactionInput
) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(getCustomersCustomerCashBalanceTransactionsTransactionOperation, input))
  )
