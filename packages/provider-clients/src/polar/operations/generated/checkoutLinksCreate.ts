import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutLinksCreateInput = Schema.Struct({})
export type CheckoutLinksCreateInput = typeof CheckoutLinksCreateInput.Type

export const CheckoutLinksCreateOutput = Models.CheckoutLink
export type CheckoutLinksCreateOutput = typeof CheckoutLinksCreateOutput.Type

export const checkoutLinksCreateOperation = defineOperation({
  id: "polar.checkout-links:create",
  method: "POST",
  path: "/v1/checkout-links/",
  inputSchema: CheckoutLinksCreateInput,
  outputSchema: CheckoutLinksCreateOutput,
  status: [201],
  contentType: "json"
})

/**
 * Create Checkout Link
 */
export const checkoutLinksCreate = (input: CheckoutLinksCreateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutLinksCreateOperation, input)))
