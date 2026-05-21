import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutsGetInput = Schema.Struct({
  id: Schema.String
})
export type CheckoutsGetInput = typeof CheckoutsGetInput.Type

export const CheckoutsGetOutput = Models.Checkout
export type CheckoutsGetOutput = typeof CheckoutsGetOutput.Type

export const checkoutsGetOperation = defineOperation({
  id: "polar.checkouts:get",
  method: "GET",
  path: "/v1/checkouts/{id}",
  inputSchema: CheckoutsGetInput,
  outputSchema: CheckoutsGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Checkout Session
 */
export const checkoutsGet = (input: CheckoutsGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsGetOperation, input)))
