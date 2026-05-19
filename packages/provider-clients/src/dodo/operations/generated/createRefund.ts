import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateRefundInput = Schema.Struct({
  payment_id: Schema.String,
  items: Schema.optional(Schema.NullOr(Schema.Array(Models.RefundItem))),
  metadata: Schema.optional(Models.Metadata),
  reason: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CreateRefundInput = typeof CreateRefundInput.Type

export const CreateRefundOutput = Models.Refund
export type CreateRefundOutput = typeof CreateRefundOutput.Type

export const createRefundOperation = defineOperation({
  id: "dodo.createRefund",
  method: "POST",
  path: "/refunds",
  inputSchema: CreateRefundInput,
  outputSchema: CreateRefundOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["payment_id", "items", "metadata", "reason"]
})

/**
 * Create refund
 */
export const createRefund = (input: CreateRefundInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createRefundOperation, input)))
