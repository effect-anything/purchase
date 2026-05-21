import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ProductsCreateInput = Schema.Struct({})
export type ProductsCreateInput = typeof ProductsCreateInput.Type

export const ProductsCreateOutput = Models.Product
export type ProductsCreateOutput = typeof ProductsCreateOutput.Type

export const productsCreateOperation = defineOperation({
  id: "polar.products:create",
  method: "POST",
  path: "/v1/products/",
  inputSchema: ProductsCreateInput,
  outputSchema: ProductsCreateOutput,
  status: [201],
  contentType: "json"
})

/**
 * Create Product
 */
export const productsCreate = (input: ProductsCreateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(productsCreateOperation, input)))
