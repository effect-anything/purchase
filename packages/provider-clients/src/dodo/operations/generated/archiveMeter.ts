import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ArchiveMeterInput = Schema.Struct({
  id: Schema.String
})
export type ArchiveMeterInput = typeof ArchiveMeterInput.Type

export const ArchiveMeterOutput = Schema.Unknown
export type ArchiveMeterOutput = typeof ArchiveMeterOutput.Type

export const archiveMeterOperation = defineOperation({
  id: "dodo.archiveMeter",
  method: "DELETE",
  path: "/meters/{id}",
  inputSchema: ArchiveMeterInput,
  outputSchema: ArchiveMeterOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Archive meter
 */
export const archiveMeter = (input: ArchiveMeterInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(archiveMeterOperation, input)))
