import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerResource = Schema.Struct({
  type: Schema.Literal("customers"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.CustomerAttributes> => Models.CustomerAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type CustomerResource = typeof CustomerResource.Type
