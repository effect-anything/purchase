import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerResource = Schema.Struct({
  type: Schema.Literal("customers"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.CustomerAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type CustomerResource = typeof CustomerResource.Type
