import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const RefundOrderInput = Schema.Struct({
  id: Schema.String,
  data: Models.OrderRefundData
})
export type RefundOrderInput = typeof RefundOrderInput.Type

export const RefundOrderOutput = Models.OrderResponse
export type RefundOrderOutput = typeof RefundOrderOutput.Type

export const refundOrderOperation = defineOperation({
  id: "lemon.refundOrder",
  method: "POST",
  path: "/orders/{id}/refund",
  inputSchema: RefundOrderInput,
  outputSchema: RefundOrderOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["data"]
})

/**
 * Issue an order refund
 */
export const refundOrder = (input: RefundOrderInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(refundOrderOperation, input)))
