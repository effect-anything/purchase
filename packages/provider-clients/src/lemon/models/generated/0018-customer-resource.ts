import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerResource = Schema.Struct({
  type: Schema.Literal("customers"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.CustomerAttributes, any, any> =>
      Models.CustomerAttributes as Schema.Schema<Models.CustomerAttributes, any, any>
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
export type CustomerResource = typeof CustomerResource.Type
