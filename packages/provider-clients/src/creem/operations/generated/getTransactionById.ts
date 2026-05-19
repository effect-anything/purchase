import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const GetTransactionByIdInput = Schema.Struct({
  transaction_id: Schema.String,
})
export type GetTransactionByIdInput = typeof GetTransactionByIdInput.Type

export const GetTransactionByIdOutput = Models.TransactionEntity
export type GetTransactionByIdOutput = typeof GetTransactionByIdOutput.Type

export const getTransactionByIdOperation = defineOperation({
  id: "creem.getTransactionById",
  method: "GET",
  path: "/transactions",
  inputSchema: GetTransactionByIdInput,
  outputSchema: GetTransactionByIdOutput,
  status: [200],
  contentType: "json",
  queryParams: ["transaction_id"]
})

/**
 * Get a transaction by ID
 */
export const getTransactionById = (input: GetTransactionByIdInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(getTransactionByIdOperation, input)))
