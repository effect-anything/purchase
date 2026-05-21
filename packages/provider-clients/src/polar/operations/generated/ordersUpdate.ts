import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const OrdersUpdateInput = Schema.Struct({
  id: Schema.String,
  billing_name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_address: Schema.optional(Schema.NullOr(Models.AddressInput))
})
export type OrdersUpdateInput = typeof OrdersUpdateInput.Type

export const OrdersUpdateOutput = Models.Order
export type OrdersUpdateOutput = typeof OrdersUpdateOutput.Type

export const ordersUpdateOperation = defineOperation({
  id: "polar.orders:update",
  method: "PATCH",
  path: "/v1/orders/{id}",
  inputSchema: OrdersUpdateInput,
  outputSchema: OrdersUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["billing_name", "billing_address"]
})

/**
 * Update Order
 */
export const ordersUpdate = (input: OrdersUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(ordersUpdateOperation, input)))
