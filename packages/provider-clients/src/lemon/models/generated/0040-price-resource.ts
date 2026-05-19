import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PriceResource = Schema.Struct({
  type: Schema.Literal("prices"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.PriceAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type PriceResource = typeof PriceResource.Type
