import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetCheckoutSessionInput = Schema.Struct({
  id: Schema.String,
})
export type GetCheckoutSessionInput = typeof GetCheckoutSessionInput.Type

export const GetCheckoutSessionOutput = Models.CheckoutSession
export type GetCheckoutSessionOutput = typeof GetCheckoutSessionOutput.Type

export const getCheckoutSessionOperation = defineOperation({
  id: "dodo.getCheckoutSession",
  method: "GET",
  path: "/checkouts/{id}",
  inputSchema: GetCheckoutSessionInput,
  outputSchema: GetCheckoutSessionOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get checkout session
 */
export const getCheckoutSession = (input: GetCheckoutSessionInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getCheckoutSessionOperation, input)))
