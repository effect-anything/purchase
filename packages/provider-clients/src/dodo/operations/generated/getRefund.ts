import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetRefundInput = Schema.Struct({
  refund_id: Schema.String,
})
export type GetRefundInput = typeof GetRefundInput.Type

export const GetRefundOutput = Models.Refund
export type GetRefundOutput = typeof GetRefundOutput.Type

export const getRefundOperation = defineOperation({
  id: "dodo.getRefund",
  method: "GET",
  path: "/refunds/{refund_id}",
  inputSchema: GetRefundInput,
  outputSchema: GetRefundOutput,
  status: [200],
  contentType: "json",
  pathParams: ["refund_id"]
})

/**
 * Get refund
 */
export const getRefund = (input: GetRefundInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getRefundOperation, input)))
