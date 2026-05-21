import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { LemonClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetOrderInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String)
})
export type GetOrderInput = typeof GetOrderInput.Type

export const GetOrderOutput = Models.OrderResponse
export type GetOrderOutput = typeof GetOrderOutput.Type

export const getOrderOperation = defineOperation({
  id: "lemon.getOrder",
  method: "GET",
  path: "/orders/{id}",
  inputSchema: GetOrderInput,
  outputSchema: GetOrderOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get order
 */
export const getOrder = (input: GetOrderInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getOrderOperation, input)))
