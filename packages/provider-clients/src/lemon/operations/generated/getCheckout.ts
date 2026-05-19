import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const GetCheckoutInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String),
})
export type GetCheckoutInput = typeof GetCheckoutInput.Type

export const GetCheckoutOutput = Models.CheckoutResponse
export type GetCheckoutOutput = typeof GetCheckoutOutput.Type

export const getCheckoutOperation = defineOperation({
  id: "lemon.getCheckout",
  method: "GET",
  path: "/checkouts/{id}",
  inputSchema: GetCheckoutInput,
  outputSchema: GetCheckoutOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get checkout
 */
export const getCheckout = (input: GetCheckoutInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getCheckoutOperation, input)))
