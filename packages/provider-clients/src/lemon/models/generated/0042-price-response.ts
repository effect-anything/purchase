import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceResponse = Schema.Struct({
  data: Schema.suspend(
    (): Schema.Schema<Models.PriceResource, any, any> =>
      Models.PriceResource as Schema.Schema<Models.PriceResource, any, any>
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
export type PriceResponse = typeof PriceResponse.Type
