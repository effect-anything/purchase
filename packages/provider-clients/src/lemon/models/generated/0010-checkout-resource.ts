import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutResource = Schema.Struct({
  type: Schema.Literal("checkouts"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.CheckoutAttributes, any, any> =>
      Models.CheckoutAttributes as Schema.Schema<Models.CheckoutAttributes, any, any>
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
export type CheckoutResource = typeof CheckoutResource.Type
