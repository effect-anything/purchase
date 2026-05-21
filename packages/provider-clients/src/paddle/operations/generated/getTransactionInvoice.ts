import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetTransactionInvoiceInput = Schema.Struct({
  transaction_id: Schema.String,
  disposition: Schema.optional(Models.Disposition)
})
export type GetTransactionInvoiceInput = typeof GetTransactionInvoiceInput.Type

export const GetTransactionInvoiceOutput = Models.GetInvoicePdfResponse
export type GetTransactionInvoiceOutput = typeof GetTransactionInvoiceOutput.Type

export const getTransactionInvoiceOperation = defineOperation({
  id: "paddle.get-transaction-invoice",
  method: "GET",
  path: "/transactions/{transaction_id}/invoice",
  inputSchema: GetTransactionInvoiceInput,
  outputSchema: GetTransactionInvoiceOutput,
  status: [200],
  contentType: "json",
  pathParams: ["transaction_id"],
  queryParams: ["disposition"]
})

/**
 * Get a PDF invoice for a transaction
 */
export const getTransactionInvoice = (input: GetTransactionInvoiceInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getTransactionInvoiceOperation, input)))
