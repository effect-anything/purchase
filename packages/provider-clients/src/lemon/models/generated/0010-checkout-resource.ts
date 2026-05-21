import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutResource = Schema.Struct({
  type: Schema.Literal("checkouts"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.CheckoutAttributes> => Models.CheckoutAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type CheckoutResource = typeof CheckoutResource.Type
