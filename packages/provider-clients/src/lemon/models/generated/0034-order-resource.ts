import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderResource = Schema.Struct({
  type: Schema.Literal("orders"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.OrderAttributes, any, any> =>
      Models.OrderAttributes as Schema.Schema<Models.OrderAttributes, any, any>
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
export type OrderResource = typeof OrderResource.Type
