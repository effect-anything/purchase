import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetProductsIdInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  id: Schema.String
})
export type GetProductsIdInput = typeof GetProductsIdInput.Type

export const GetProductsIdOutput = Models.Product
export type GetProductsIdOutput = typeof GetProductsIdOutput.Type

export const getProductsIdOperation = defineOperation({
  id: "stripe.GetProductsId",
  method: "GET",
  path: "/v1/products/{id}",
  inputSchema: GetProductsIdInput,
  outputSchema: GetProductsIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["id"],
  queryParams: ["expand"]
})

/**
 * Retrieve a product
 */
export const getProductsId = (input: GetProductsIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getProductsIdOperation, input)))
