import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { LemonClient } from "../../client.ts"

export const GetProductInput = Schema.Struct({
  id: Schema.String,
  include: Schema.optional(Schema.String),
})
export type GetProductInput = typeof GetProductInput.Type

export const GetProductOutput = Models.ProductResponse
export type GetProductOutput = typeof GetProductOutput.Type

export const getProductOperation = defineOperation({
  id: "lemon.getProduct",
  method: "GET",
  path: "/products/{id}",
  inputSchema: GetProductInput,
  outputSchema: GetProductOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["include"]
})

/**
 * Get product
 */
export const getProduct = (input: GetProductInput) =>
  LemonClient.pipe(Effect.flatMap((client) => client.request(getProductOperation, input)))
