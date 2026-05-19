import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const GetTransactionInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.TransactionIncludeQuery)),
  transaction_id: Schema.String,
})
export type GetTransactionInput = typeof GetTransactionInput.Type

export const GetTransactionOutput = Schema.Struct({
  data: Models.TransactionIncludes,
  meta: Models.Meta,
})
export type GetTransactionOutput = typeof GetTransactionOutput.Type

export const getTransactionOperation = defineOperation({
  id: "paddle.get-transaction",
  method: "GET",
  path: "/transactions/{transaction_id}",
  inputSchema: GetTransactionInput,
  outputSchema: GetTransactionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["transaction_id"],
  queryParams: ["include"]
})

/**
 * Get a transaction
 */
export const getTransaction = (input: GetTransactionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getTransactionOperation, input)))
