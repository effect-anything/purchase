import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const RetrieveCheckoutInput = Schema.Struct({
  checkout_id: Schema.String,
})
export type RetrieveCheckoutInput = typeof RetrieveCheckoutInput.Type

export const RetrieveCheckoutOutput = Models.CheckoutEntity
export type RetrieveCheckoutOutput = typeof RetrieveCheckoutOutput.Type

export const retrieveCheckoutOperation = defineOperation({
  id: "creem.retrieveCheckout",
  method: "GET",
  path: "/checkouts",
  inputSchema: RetrieveCheckoutInput,
  outputSchema: RetrieveCheckoutOutput,
  status: [200],
  contentType: "json",
  queryParams: ["checkout_id"]
})

/**
 * Retrieve a checkout session.
 */
export const retrieveCheckout = (input: RetrieveCheckoutInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(retrieveCheckoutOperation, input)))
