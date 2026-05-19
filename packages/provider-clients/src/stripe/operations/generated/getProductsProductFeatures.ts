import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetProductsProductFeaturesInput = Schema.Struct({
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  product: Schema.String,
  starting_after: Schema.optional(Schema.String),
})
export type GetProductsProductFeaturesInput = typeof GetProductsProductFeaturesInput.Type

export const GetProductsProductFeaturesOutput = Schema.Struct({
  data: Schema.Array(Models.ProductFeature),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetProductsProductFeaturesOutput = typeof GetProductsProductFeaturesOutput.Type

export const getProductsProductFeaturesOperation = defineOperation({
  id: "stripe.GetProductsProductFeatures",
  method: "GET",
  path: "/v1/products/{product}/features",
  inputSchema: GetProductsProductFeaturesInput,
  outputSchema: GetProductsProductFeaturesOutput,
  status: [200],
  contentType: "form",
  pathParams: ["product"],
  queryParams: ["ending_before", "expand", "limit", "starting_after"]
})

/**
 * List all features attached to a product
 */
export const getProductsProductFeatures = (input: GetProductsProductFeaturesInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getProductsProductFeaturesOperation, input)))
