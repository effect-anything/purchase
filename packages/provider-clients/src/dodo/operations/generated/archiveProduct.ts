import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ArchiveProductInput = Schema.Struct({
  id: Schema.String,
})
export type ArchiveProductInput = typeof ArchiveProductInput.Type

export const ArchiveProductOutput = Schema.Unknown
export type ArchiveProductOutput = typeof ArchiveProductOutput.Type

export const archiveProductOperation = defineOperation({
  id: "dodo.archiveProduct",
  method: "DELETE",
  path: "/products/{id}",
  inputSchema: ArchiveProductInput,
  outputSchema: ArchiveProductOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Archive product
 */
export const archiveProduct = (input: ArchiveProductInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(archiveProductOperation, input)))
