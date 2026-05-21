import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const OrdersExportInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  product_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String))))
})
export type OrdersExportInput = typeof OrdersExportInput.Type

export const OrdersExportOutput = Schema.Unknown
export type OrdersExportOutput = typeof OrdersExportOutput.Type

export const ordersExportOperation = defineOperation({
  id: "polar.orders:export",
  method: "GET",
  path: "/v1/orders/export",
  inputSchema: OrdersExportInput,
  outputSchema: OrdersExportOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id", "product_id"]
})

/**
 * Export Orders
 */
export const ordersExport = (input: OrdersExportInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersExportOperation, input)))
