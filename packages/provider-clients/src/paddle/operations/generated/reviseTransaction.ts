import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const ReviseTransactionInput = Schema.Struct({
  transaction_id: Schema.String,
  customer: Schema.optional(Models.TransactionReviseCustomer),
  business: Schema.optional(Models.TransactionReviseBusiness),
  address: Schema.optional(Models.TransactionReviseAddress),
})
export type ReviseTransactionInput = typeof ReviseTransactionInput.Type

export const ReviseTransactionOutput = Schema.Struct({
  data: Models.Transaction,
  meta: Models.Meta,
})
export type ReviseTransactionOutput = typeof ReviseTransactionOutput.Type

export const reviseTransactionOperation = defineOperation({
  id: "paddle.revise-transaction",
  method: "POST",
  path: "/transactions/{transaction_id}/revise",
  inputSchema: ReviseTransactionInput,
  outputSchema: ReviseTransactionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["transaction_id"],
  bodyParams: ["customer", "business", "address"]
})

/**
 * Revise customer information on a billed or completed transaction
 */
export const reviseTransaction = (input: ReviseTransactionInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(reviseTransactionOperation, input)))
