import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const GetProductInput = Schema.Struct({
  include: Schema.optional(Schema.Array(Models.ProductIncludeEnum)),
  product_id: Schema.String,
})
export type GetProductInput = typeof GetProductInput.Type

export const GetProductOutput = Schema.Struct({
  data: Models.ProductIncludes,
  meta: Models.Meta,
})
export type GetProductOutput = typeof GetProductOutput.Type

export const getProductOperation = defineOperation({
  id: "paddle.get-product",
  method: "GET",
  path: "/products/{product_id}",
  inputSchema: GetProductInput,
  outputSchema: GetProductOutput,
  status: [200],
  contentType: "json",
  pathParams: ["product_id"],
  queryParams: ["include"]
})

/**
 * Get a product
 */
export const getProduct = (input: GetProductInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(getProductOperation, input)))
