import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const SearchTransactionsInput = Schema.Struct({
  customer_id: Schema.optional(Schema.String),
  order_id: Schema.optional(Schema.String),
  product_id: Schema.optional(Schema.String),
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number)
})
export type SearchTransactionsInput = typeof SearchTransactionsInput.Type

export const SearchTransactionsOutput = Models.TransactionListEntity
export type SearchTransactionsOutput = typeof SearchTransactionsOutput.Type

export const searchTransactionsOperation = defineOperation({
  id: "creem.searchTransactions",
  method: "GET",
  path: "/transactions/search",
  inputSchema: SearchTransactionsInput,
  outputSchema: SearchTransactionsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["customer_id", "order_id", "product_id", "page_number", "page_size"]
})

/**
 * List all transactions
 */
export const searchTransactions = (input: SearchTransactionsInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(searchTransactionsOperation, input)))
