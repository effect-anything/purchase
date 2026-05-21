import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UnarchiveMeterInput = Schema.Struct({
  id: Schema.String
})
export type UnarchiveMeterInput = typeof UnarchiveMeterInput.Type

export const UnarchiveMeterOutput = Schema.Unknown
export type UnarchiveMeterOutput = typeof UnarchiveMeterOutput.Type

export const unarchiveMeterOperation = defineOperation({
  id: "dodo.unarchiveMeter",
  method: "POST",
  path: "/meters/{id}/unarchive",
  inputSchema: UnarchiveMeterInput,
  outputSchema: UnarchiveMeterOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Unarchive meter
 */
export const unarchiveMeter = (input: UnarchiveMeterInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(unarchiveMeterOperation, input)))
