import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListTransactionsInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.TransactionIncludeQuery)),
  id: Schema.optional(Schema.Array(Schema.String)),
  after: Schema.optional(Schema.String),
  billed_at: Schema.optional(Schema.String),
  collection_mode: Schema.optional(Models.CollectionMode),
  created_at: Schema.optional(Schema.String),
  customer_id: Schema.optional(Schema.Array(Schema.String)),
  invoice_number: Schema.optional(Schema.Array(Schema.String)),
  origin: Schema.optional(Schema.Array(Models.TransactionOriginQuery)),
  order_by: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Array(Models.TransactionStatusQuery)),
  subscription_id: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  per_page: Schema.optional(Schema.Number),
  updated_at: Schema.optional(Schema.String)
})
export type ListTransactionsInput = typeof ListTransactionsInput.Type

export const ListTransactionsOutput = Schema.Struct({
  data: Schema.Array(Models.TransactionIncludes),
  meta: Models.PaginatedMeta
})
export type ListTransactionsOutput = typeof ListTransactionsOutput.Type

export const listTransactionsOperation = defineOperation({
  id: "paddle.list-transactions",
  method: "GET",
  path: "/transactions",
  inputSchema: ListTransactionsInput,
  outputSchema: ListTransactionsOutput,
  status: [200],
  contentType: "json",
  queryParams: [
    "include",
    "id",
    "after",
    "billed_at",
    "collection_mode",
    "created_at",
    "customer_id",
    "invoice_number",
    "origin",
    "order_by",
    "status",
    "subscription_id",
    "per_page",
    "updated_at"
  ]
})

/**
 * List transactions
 */
export const listTransactions = (input: ListTransactionsInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listTransactionsOperation, input)))
