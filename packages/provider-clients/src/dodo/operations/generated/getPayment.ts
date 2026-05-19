import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetPaymentInput = Schema.Struct({
  payment_id: Schema.String,
})
export type GetPaymentInput = typeof GetPaymentInput.Type

export const GetPaymentOutput = Models.Payment
export type GetPaymentOutput = typeof GetPaymentOutput.Type

export const getPaymentOperation = defineOperation({
  id: "dodo.getPayment",
  method: "GET",
  path: "/payments/{payment_id}",
  inputSchema: GetPaymentInput,
  outputSchema: GetPaymentOutput,
  status: [200],
  contentType: "json",
  pathParams: ["payment_id"]
})

/**
 * Get payment
 */
export const getPayment = (input: GetPaymentInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getPaymentOperation, input)))
