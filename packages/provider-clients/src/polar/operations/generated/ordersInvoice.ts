import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const OrdersInvoiceInput = Schema.Struct({
  id: Schema.String,
})
export type OrdersInvoiceInput = typeof OrdersInvoiceInput.Type

export const OrdersInvoiceOutput = Models.OrderInvoice
export type OrdersInvoiceOutput = typeof OrdersInvoiceOutput.Type

export const ordersInvoiceOperation = defineOperation({
  id: "polar.orders:invoice",
  method: "GET",
  path: "/v1/orders/{id}/invoice",
  inputSchema: OrdersInvoiceInput,
  outputSchema: OrdersInvoiceOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Order Invoice
 */
export const ordersInvoice = (input: OrdersInvoiceInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersInvoiceOperation, input)))
