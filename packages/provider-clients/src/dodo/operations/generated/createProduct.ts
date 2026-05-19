import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateProductInput = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.String),
  metadata: Schema.optional(Models.Metadata),
})
export type CreateProductInput = typeof CreateProductInput.Type

export const CreateProductOutput = Models.Product
export type CreateProductOutput = typeof CreateProductOutput.Type

export const createProductOperation = defineOperation({
  id: "dodo.createProduct",
  method: "POST",
  path: "/products",
  inputSchema: CreateProductInput,
  outputSchema: CreateProductOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["name", "description", "metadata"]
})

/**
 * Create product
 */
export const createProduct = (input: CreateProductInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createProductOperation, input)))
