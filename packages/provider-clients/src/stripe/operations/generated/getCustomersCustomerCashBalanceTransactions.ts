import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCustomersCustomerCashBalanceTransactionsInput = Schema.Struct({
  customer: Schema.String,
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String)
})
export type GetCustomersCustomerCashBalanceTransactionsInput =
  typeof GetCustomersCustomerCashBalanceTransactionsInput.Type

export const GetCustomersCustomerCashBalanceTransactionsOutput = Schema.Struct({
  data: Schema.Array(Models.CustomerCashBalanceTransaction),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String
})
export type GetCustomersCustomerCashBalanceTransactionsOutput =
  typeof GetCustomersCustomerCashBalanceTransactionsOutput.Type

export const getCustomersCustomerCashBalanceTransactionsOperation = defineOperation({
  id: "stripe.GetCustomersCustomerCashBalanceTransactions",
  method: "GET",
  path: "/v1/customers/{customer}/cash_balance_transactions",
  inputSchema: GetCustomersCustomerCashBalanceTransactionsInput,
  outputSchema: GetCustomersCustomerCashBalanceTransactionsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["ending_before", "expand", "limit", "starting_after"]
})

/**
 * List cash balance transactions
 */
export const getCustomersCustomerCashBalanceTransactions = (input: GetCustomersCustomerCashBalanceTransactionsInput) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(getCustomersCustomerCashBalanceTransactionsOperation, input))
  )
