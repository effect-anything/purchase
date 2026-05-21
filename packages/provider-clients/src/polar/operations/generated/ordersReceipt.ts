import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const OrdersReceiptInput = Schema.Struct({
  id: Schema.String
})
export type OrdersReceiptInput = typeof OrdersReceiptInput.Type

export const OrdersReceiptOutput = Models.OrderReceipt
export type OrdersReceiptOutput = typeof OrdersReceiptOutput.Type

export const ordersReceiptOperation = defineOperation({
  id: "polar.orders:receipt",
  method: "GET",
  path: "/v1/orders/{id}/receipt",
  inputSchema: OrdersReceiptInput,
  outputSchema: OrdersReceiptOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Order Receipt
 */
export const ordersReceipt = (input: OrdersReceiptInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersReceiptOperation, input)))
