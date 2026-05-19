import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const VariantResource = Schema.Struct({
  type: Schema.Literal("variants"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.VariantAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type VariantResource = typeof VariantResource.Type
