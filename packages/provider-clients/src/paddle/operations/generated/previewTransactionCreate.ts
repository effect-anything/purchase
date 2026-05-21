import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PreviewTransactionCreateInput = Schema.Struct({})
export type PreviewTransactionCreateInput = typeof PreviewTransactionCreateInput.Type

export const PreviewTransactionCreateOutput = Schema.Struct({
  data: Models.TransactionPreview,
  meta: Models.Meta
})
export type PreviewTransactionCreateOutput = typeof PreviewTransactionCreateOutput.Type

export const previewTransactionCreateOperation = defineOperation({
  id: "paddle.preview-transaction-create",
  method: "POST",
  path: "/transactions/preview",
  inputSchema: PreviewTransactionCreateInput,
  outputSchema: PreviewTransactionCreateOutput,
  status: [200],
  contentType: "json"
})

/**
 * Preview a transaction
 */
export const previewTransactionCreate = (input: PreviewTransactionCreateInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(previewTransactionCreateOperation, input)))
