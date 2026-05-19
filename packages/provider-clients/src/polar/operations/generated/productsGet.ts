import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const ProductsGetInput = Schema.Struct({
  id: Schema.String,
})
export type ProductsGetInput = typeof ProductsGetInput.Type

export const ProductsGetOutput = Models.Product
export type ProductsGetOutput = typeof ProductsGetOutput.Type

export const productsGetOperation = defineOperation({
  id: "polar.products:get",
  method: "GET",
  path: "/v1/products/{id}",
  inputSchema: ProductsGetInput,
  outputSchema: ProductsGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Product
 */
export const productsGet = (input: ProductsGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(productsGetOperation, input)))
