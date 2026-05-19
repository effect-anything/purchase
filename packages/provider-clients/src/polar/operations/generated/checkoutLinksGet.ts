import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CheckoutLinksGetInput = Schema.Struct({
  id: Schema.String,
})
export type CheckoutLinksGetInput = typeof CheckoutLinksGetInput.Type

export const CheckoutLinksGetOutput = Models.CheckoutLink
export type CheckoutLinksGetOutput = typeof CheckoutLinksGetOutput.Type

export const checkoutLinksGetOperation = defineOperation({
  id: "polar.checkout-links:get",
  method: "GET",
  path: "/v1/checkout-links/{id}",
  inputSchema: CheckoutLinksGetInput,
  outputSchema: CheckoutLinksGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Checkout Link
 */
export const checkoutLinksGet = (input: CheckoutLinksGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutLinksGetOperation, input)))
