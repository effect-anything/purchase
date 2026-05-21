import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListMetersInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  archived: Schema.optional(Schema.Boolean)
})
export type ListMetersInput = typeof ListMetersInput.Type

export const ListMetersOutput = Models.MeterListResponse
export type ListMetersOutput = typeof ListMetersOutput.Type

export const listMetersOperation = defineOperation({
  id: "dodo.listMeters",
  method: "GET",
  path: "/meters",
  inputSchema: ListMetersInput,
  outputSchema: ListMetersOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size", "archived"]
})

/**
 * List meters
 */
export const listMeters = (input: ListMetersInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listMetersOperation, input)))
