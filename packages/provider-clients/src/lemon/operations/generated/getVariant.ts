import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const GetVariantInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String),
})
export type GetVariantInput = typeof GetVariantInput.Type

export const GetVariantOutput = Models.VariantResponse
export type GetVariantOutput = typeof GetVariantOutput.Type

export const getVariantOperation = defineOperation({
  id: "lemon.getVariant",
  method: "GET",
  path: "/variants/{id}",
  inputSchema: GetVariantInput,
  outputSchema: GetVariantOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get variant
 */
export const getVariant = (input: GetVariantInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getVariantOperation, input)))
