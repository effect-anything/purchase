import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceResource = Schema.Struct({
  type: Schema.Literal("prices"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.PriceAttributes> => Models.PriceAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type PriceResource = typeof PriceResource.Type
