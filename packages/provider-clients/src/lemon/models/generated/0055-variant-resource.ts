import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const VariantResource = Schema.Struct({
  type: Schema.Literal("variants"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.VariantAttributes> => Models.VariantAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type VariantResource = typeof VariantResource.Type
