import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const CreateCheckoutInput = Schema.Struct({
  data: Models.CheckoutCreateData,
})
export type CreateCheckoutInput = typeof CreateCheckoutInput.Type

export const CreateCheckoutOutput = Models.CheckoutResponse
export type CreateCheckoutOutput = typeof CreateCheckoutOutput.Type

export const createCheckoutOperation = defineOperation({
  id: "lemon.createCheckout",
  method: "POST",
  path: "/checkouts",
  inputSchema: CreateCheckoutInput,
  outputSchema: CreateCheckoutOutput,
  status: [201],
  contentType: "json",
  bodyParams: ["data"]
})

/**
 * Create checkout
 */
export const createCheckout = (input: CreateCheckoutInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(createCheckoutOperation, input)))
