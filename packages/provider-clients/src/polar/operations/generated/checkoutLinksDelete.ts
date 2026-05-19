import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const CheckoutLinksDeleteInput = Schema.Struct({
  id: Schema.String,
})
export type CheckoutLinksDeleteInput = typeof CheckoutLinksDeleteInput.Type

export const CheckoutLinksDeleteOutput = Schema.Unknown
export type CheckoutLinksDeleteOutput = typeof CheckoutLinksDeleteOutput.Type

export const checkoutLinksDeleteOperation = defineOperation({
  id: "polar.checkout-links:delete",
  method: "DELETE",
  path: "/v1/checkout-links/{id}",
  inputSchema: CheckoutLinksDeleteInput,
  outputSchema: CheckoutLinksDeleteOutput,
  status: [204],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Delete Checkout Link
 */
export const checkoutLinksDelete = (input: CheckoutLinksDeleteInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutLinksDeleteOperation, input)))
