import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const DeleteProductsProductFeaturesIdInput = Schema.Struct({
  id: Schema.String,
  product: Schema.String
})
export type DeleteProductsProductFeaturesIdInput = typeof DeleteProductsProductFeaturesIdInput.Type

export const DeleteProductsProductFeaturesIdOutput = Models.DeletedProductFeature
export type DeleteProductsProductFeaturesIdOutput = typeof DeleteProductsProductFeaturesIdOutput.Type

export const deleteProductsProductFeaturesIdOperation = defineOperation({
  id: "stripe.DeleteProductsProductFeaturesId",
  method: "DELETE",
  path: "/v1/products/{product}/features/{id}",
  inputSchema: DeleteProductsProductFeaturesIdInput,
  outputSchema: DeleteProductsProductFeaturesIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["id", "product"]
})

/**
 * Remove a feature from a product
 */
export const deleteProductsProductFeaturesId = (input: DeleteProductsProductFeaturesIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(deleteProductsProductFeaturesIdOperation, input)))
