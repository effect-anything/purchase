import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetMeterInput = Schema.Struct({
  id: Schema.String,
})
export type GetMeterInput = typeof GetMeterInput.Type

export const GetMeterOutput = Models.Meter
export type GetMeterOutput = typeof GetMeterOutput.Type

export const getMeterOperation = defineOperation({
  id: "dodo.getMeter",
  method: "GET",
  path: "/meters/{id}",
  inputSchema: GetMeterInput,
  outputSchema: GetMeterOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get meter
 */
export const getMeter = (input: GetMeterInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getMeterOperation, input)))
