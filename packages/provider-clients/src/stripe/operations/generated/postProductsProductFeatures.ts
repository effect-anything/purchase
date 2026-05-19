import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostProductsProductFeaturesInput = Schema.Struct({
  product: Schema.String,
  entitlement_feature: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
})
export type PostProductsProductFeaturesInput = typeof PostProductsProductFeaturesInput.Type

export const PostProductsProductFeaturesOutput = Models.ProductFeature
export type PostProductsProductFeaturesOutput = typeof PostProductsProductFeaturesOutput.Type

export const postProductsProductFeaturesOperation = defineOperation({
  id: "stripe.PostProductsProductFeatures",
  method: "POST",
  path: "/v1/products/{product}/features",
  inputSchema: PostProductsProductFeaturesInput,
  outputSchema: PostProductsProductFeaturesOutput,
  status: [200],
  contentType: "form",
  pathParams: ["product"],
  bodyParams: ["entitlement_feature", "expand"]
})

/**
 * Attach a feature to a product
 */
export const postProductsProductFeatures = (input: PostProductsProductFeaturesInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postProductsProductFeaturesOperation, input)))
