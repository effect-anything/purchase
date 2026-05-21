import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderResource = Schema.Struct({
  type: Schema.Literal("orders"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.OrderAttributes> => Models.OrderAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type OrderResource = typeof OrderResource.Type
