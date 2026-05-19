import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const OrdersGetInput = Schema.Struct({
  id: Schema.String,
})
export type OrdersGetInput = typeof OrdersGetInput.Type

export const OrdersGetOutput = Models.Order
export type OrdersGetOutput = typeof OrdersGetOutput.Type

export const ordersGetOperation = defineOperation({
  id: "polar.orders:get",
  method: "GET",
  path: "/v1/orders/{id}",
  inputSchema: OrdersGetInput,
  outputSchema: OrdersGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Order
 */
export const ordersGet = (input: OrdersGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersGetOperation, input)))
