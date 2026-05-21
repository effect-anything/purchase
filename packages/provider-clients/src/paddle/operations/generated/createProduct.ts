import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateProductInput = Schema.Struct({
  id: Schema.optional(Models.ProductId),
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.optional(Models.CatalogType),
  tax_category: Models.TaxCategory,
  image_url: Schema.optional(Schema.NullOr(Schema.Union(Models.ImageUrl, Models.EmptyString))),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  import_meta: Schema.optional(Schema.NullOr(Models.ImportMeta))
})
export type CreateProductInput = typeof CreateProductInput.Type

export const CreateProductOutput = Schema.Struct({
  data: Models.Product,
  meta: Models.Meta
})
export type CreateProductOutput = typeof CreateProductOutput.Type

export const createProductOperation = defineOperation({
  id: "paddle.create-product",
  method: "POST",
  path: "/products",
  inputSchema: CreateProductInput,
  outputSchema: CreateProductOutput,
  status: [201],
  contentType: "json",
  bodyParams: ["id", "name", "description", "type", "tax_category", "image_url", "custom_data", "import_meta"]
})

/**
 * Create a product
 */
export const createProduct = (input: CreateProductInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createProductOperation, input)))
