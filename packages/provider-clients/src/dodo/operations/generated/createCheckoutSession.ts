import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateCheckoutSessionInput = Schema.Struct({
  product_cart: Schema.Array(Models.CheckoutSessionProductItem),
  customer: Schema.optional(Models.CustomerCreateRequest),
  return_url: Schema.optional(Schema.String),
  cancel_url: Schema.optional(Schema.String),
  metadata: Schema.optional(Models.Metadata)
})
export type CreateCheckoutSessionInput = typeof CreateCheckoutSessionInput.Type

export const CreateCheckoutSessionOutput = Models.CheckoutSession
export type CreateCheckoutSessionOutput = typeof CreateCheckoutSessionOutput.Type

export const createCheckoutSessionOperation = defineOperation({
  id: "dodo.createCheckoutSession",
  method: "POST",
  path: "/checkouts",
  inputSchema: CreateCheckoutSessionInput,
  outputSchema: CreateCheckoutSessionOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["product_cart", "customer", "return_url", "cancel_url", "metadata"]
})

/**
 * Create checkout session
 */
export const createCheckoutSession = (input: CreateCheckoutSessionInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createCheckoutSessionOperation, input)))
