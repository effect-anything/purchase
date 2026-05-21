import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceResource = Schema.Struct({
  type: Schema.Literal("prices"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.PriceAttributes, any, any> =>
      Models.PriceAttributes as Schema.Schema<Models.PriceAttributes, any, any>
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
export type PriceResource = typeof PriceResource.Type
