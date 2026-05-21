import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CheckoutsCreateInput = Schema.Struct({})
export type CheckoutsCreateInput = typeof CheckoutsCreateInput.Type

export const CheckoutsCreateOutput = Models.Checkout
export type CheckoutsCreateOutput = typeof CheckoutsCreateOutput.Type

export const checkoutsCreateOperation = defineOperation({
  id: "polar.checkouts:create",
  method: "POST",
  path: "/v1/checkouts/",
  inputSchema: CheckoutsCreateInput,
  outputSchema: CheckoutsCreateOutput,
  status: [201],
  contentType: "json"
})

/**
 * Create Checkout Session
 */
export const checkoutsCreate = (input: CheckoutsCreateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(checkoutsCreateOperation, input)))
