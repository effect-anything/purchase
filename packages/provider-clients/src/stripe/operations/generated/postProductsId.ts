import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostProductsIdInput = Schema.Struct({
  id: Schema.String,
  active: Schema.optional(Schema.Boolean),
  default_price: Schema.optional(Schema.String),
  description: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  expand: Schema.optional(Schema.Array(Schema.String)),
  images: Schema.optional(Schema.Union(Schema.Array(Schema.String), Schema.Literal(""))),
  marketing_features: Schema.optional(Schema.Union(Schema.Array(Schema.Struct({
  name: Schema.String,
})), Schema.Literal(""))),
  metadata: Schema.optional(Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))),
  package_dimensions: Schema.optional(Schema.Union(Schema.Struct({
  height: Schema.Number,
  length: Schema.Number,
  weight: Schema.Number,
  width: Schema.Number,
}), Schema.Literal(""))),
  shippable: Schema.optional(Schema.Boolean),
  statement_descriptor: Schema.optional(Schema.String),
  tax_code: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  unit_label: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  url: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
})
export type PostProductsIdInput = typeof PostProductsIdInput.Type

export const PostProductsIdOutput = Models.Product
export type PostProductsIdOutput = typeof PostProductsIdOutput.Type

export const postProductsIdOperation = defineOperation({
  id: "stripe.PostProductsId",
  method: "POST",
  path: "/v1/products/{id}",
  inputSchema: PostProductsIdInput,
  outputSchema: PostProductsIdOutput,
  status: [200],
  contentType: "form",
  pathParams: ["id"],
  bodyParams: ["active", "default_price", "description", "expand", "images", "marketing_features", "metadata", "name", "package_dimensions", "shippable", "statement_descriptor", "tax_code", "unit_label", "url"]
})

/**
 * Update a product
 */
export const postProductsId = (input: PostProductsIdInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postProductsIdOperation, input)))
