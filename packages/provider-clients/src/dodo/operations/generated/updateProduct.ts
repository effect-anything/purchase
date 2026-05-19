import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const UpdateProductInput = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  metadata: Schema.optional(Models.Metadata),
})
export type UpdateProductInput = typeof UpdateProductInput.Type

export const UpdateProductOutput = Schema.Unknown
export type UpdateProductOutput = typeof UpdateProductOutput.Type

export const updateProductOperation = defineOperation({
  id: "dodo.updateProduct",
  method: "PATCH",
  path: "/products/{id}",
  inputSchema: UpdateProductInput,
  outputSchema: UpdateProductOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["name", "description", "metadata"]
})

/**
 * Update product
 */
export const updateProduct = (input: UpdateProductInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(updateProductOperation, input)))
