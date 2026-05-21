import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const VariantListResponse = Schema.Struct({
  data: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.VariantResource, any, any> =>
        Models.VariantResource as Schema.Schema<Models.VariantResource, any, any>
    )
  ),
  links: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.JsonApiLinks, any, any> =>
        Models.JsonApiLinks as Schema.Schema<Models.JsonApiLinks, any, any>
    )
  ),
  meta: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.JsonApiMeta, any, any> =>
        Models.JsonApiMeta as Schema.Schema<Models.JsonApiMeta, any, any>
    )
  )
})
export type VariantListResponse = typeof VariantListResponse.Type
