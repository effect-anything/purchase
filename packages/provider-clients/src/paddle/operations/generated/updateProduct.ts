import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateProductInput = Schema.Struct({
  product_id: Schema.String,
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.optional(Models.CatalogType),
  tax_category: Schema.optional(Models.TaxCategory),
  image_url: Schema.optional(Schema.NullOr(Schema.Union(Models.ImageUrl, Models.EmptyString))),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  status: Schema.optional(Models.Status)
})
export type UpdateProductInput = typeof UpdateProductInput.Type

export const UpdateProductOutput = Schema.Struct({
  data: Models.Product,
  meta: Models.Meta
})
export type UpdateProductOutput = typeof UpdateProductOutput.Type

export const updateProductOperation = defineOperation({
  id: "paddle.update-product",
  method: "PATCH",
  path: "/products/{product_id}",
  inputSchema: UpdateProductInput,
  outputSchema: UpdateProductOutput,
  status: [200],
  contentType: "json",
  pathParams: ["product_id"],
  bodyParams: ["name", "description", "type", "tax_category", "image_url", "custom_data", "status"]
})

/**
 * Update a product
 */
export const updateProduct = (input: UpdateProductInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updateProductOperation, input)))
