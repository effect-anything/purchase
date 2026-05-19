import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCustomersCustomerBalanceTransactionsInput = Schema.Struct({
  created: Schema.optional(Schema.Union(Schema.Struct({
  gt: Schema.optional(Schema.Number),
  gte: Schema.optional(Schema.Number),
  lt: Schema.optional(Schema.Number),
  lte: Schema.optional(Schema.Number),
}), Schema.Number)),
  customer: Schema.String,
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  invoice: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
})
export type GetCustomersCustomerBalanceTransactionsInput = typeof GetCustomersCustomerBalanceTransactionsInput.Type

export const GetCustomersCustomerBalanceTransactionsOutput = Schema.Struct({
  data: Schema.Array(Models.CustomerBalanceTransaction),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetCustomersCustomerBalanceTransactionsOutput = typeof GetCustomersCustomerBalanceTransactionsOutput.Type

export const getCustomersCustomerBalanceTransactionsOperation = defineOperation({
  id: "stripe.GetCustomersCustomerBalanceTransactions",
  method: "GET",
  path: "/v1/customers/{customer}/balance_transactions",
  inputSchema: GetCustomersCustomerBalanceTransactionsInput,
  outputSchema: GetCustomersCustomerBalanceTransactionsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["created", "ending_before", "expand", "invoice", "limit", "starting_after"]
})

/**
 * List customer balance transactions
 */
export const getCustomersCustomerBalanceTransactions = (input: GetCustomersCustomerBalanceTransactionsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerBalanceTransactionsOperation, input)))
