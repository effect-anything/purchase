import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const OrdersGenerateInvoiceInput = Schema.Struct({
  id: Schema.String,
})
export type OrdersGenerateInvoiceInput = typeof OrdersGenerateInvoiceInput.Type

export const OrdersGenerateInvoiceOutput = Schema.Unknown
export type OrdersGenerateInvoiceOutput = typeof OrdersGenerateInvoiceOutput.Type

export const ordersGenerateInvoiceOperation = defineOperation({
  id: "polar.orders:generate_invoice",
  method: "POST",
  path: "/v1/orders/{id}/invoice",
  inputSchema: OrdersGenerateInvoiceInput,
  outputSchema: OrdersGenerateInvoiceOutput,
  status: [202],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Generate Order Invoice
 */
export const ordersGenerateInvoice = (input: OrdersGenerateInvoiceInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersGenerateInvoiceOperation, input)))
