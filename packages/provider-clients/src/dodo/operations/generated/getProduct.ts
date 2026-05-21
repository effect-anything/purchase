import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetProductInput = Schema.Struct({
  id: Schema.String
})
export type GetProductInput = typeof GetProductInput.Type

export const GetProductOutput = Models.Product
export type GetProductOutput = typeof GetProductOutput.Type

export const getProductOperation = defineOperation({
  id: "dodo.getProduct",
  method: "GET",
  path: "/products/{id}",
  inputSchema: GetProductInput,
  outputSchema: GetProductOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get product
 */
export const getProduct = (input: GetProductInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getProductOperation, input)))
