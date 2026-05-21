import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetProductsProductFeaturesIdInput = Schema.Struct({
  expand: Schema.optional(Schema.Array(Schema.String)),
  id: Schema.String,
  product: Schema.String
})
export type GetProductsProductFeaturesIdInput = typeof GetProductsProductFeaturesIdInput.Type

export const GetProductsProductFeaturesIdOutput = Models.ProductFeature
export type GetProductsProductFeaturesIdOutput = typeof GetProductsProductFeaturesIdOutput.Type

export const getProductsProductFeaturesIdOperation = defineOperation({
  id: "stripe.GetProductsProductFeaturesId",
  method: "GET",
  path: "/v1/products/{product}/features/{id}",
  inputSchema: GetProductsProductFeaturesIdInput,
  outputSchema: GetProductsProductFeaturesIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["id", "product"],
  queryParams: ["expand"]
})

/**
 * Retrieve a product_feature
 */
export const getProductsProductFeaturesId = (input: GetProductsProductFeaturesIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getProductsProductFeaturesIdOperation, input)))
