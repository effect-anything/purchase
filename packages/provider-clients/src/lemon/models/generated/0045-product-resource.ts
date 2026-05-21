import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductResource = Schema.Struct({
  type: Schema.Literal("products"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.ProductAttributes> => Models.ProductAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type ProductResource = typeof ProductResource.Type
