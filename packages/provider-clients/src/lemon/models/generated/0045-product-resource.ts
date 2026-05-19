import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductResource = Schema.Struct({
  type: Schema.Literal("products"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.ProductAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type ProductResource = typeof ProductResource.Type
