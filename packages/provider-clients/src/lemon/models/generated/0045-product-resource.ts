import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductResource = Schema.Struct({
  type: Schema.Literal("products"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.ProductAttributes, any, any> =>
      Models.ProductAttributes as Schema.Schema<Models.ProductAttributes, any, any>
  ),
  relationships: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.JsonApiRelationships, any, any> =>
        Models.JsonApiRelationships as Schema.Schema<Models.JsonApiRelationships, any, any>
    )
  ),
  links: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.JsonApiLinks, any, any> =>
        Models.JsonApiLinks as Schema.Schema<Models.JsonApiLinks, any, any>
    )
  )
})
export type ProductResource = typeof ProductResource.Type
