import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const VariantResource = Schema.Struct({
  type: Schema.Literal("variants"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.VariantAttributes, any, any> =>
      Models.VariantAttributes as Schema.Schema<Models.VariantAttributes, any, any>
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
export type VariantResource = typeof VariantResource.Type
