import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutsClientGetInput = Schema.Struct({
  client_secret: Schema.String
})
export type CheckoutsClientGetInput = typeof CheckoutsClientGetInput.Type

export const CheckoutsClientGetOutput = Models.CheckoutPublic
export type CheckoutsClientGetOutput = typeof CheckoutsClientGetOutput.Type

export const checkoutsClientGetOperation = defineOperation({
  id: "polar.checkouts:client_get",
  method: "GET",
  path: "/v1/checkouts/client/{client_secret}",
  inputSchema: CheckoutsClientGetInput,
  outputSchema: CheckoutsClientGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["client_secret"]
})

/**
 * Get Checkout Session from Client
 */
export const checkoutsClientGet = (input: CheckoutsClientGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsClientGetOperation, input)))
