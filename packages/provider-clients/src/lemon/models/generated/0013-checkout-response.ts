import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutResponse = Schema.Struct({
  data: Schema.suspend(
    (): Schema.Schema<Models.CheckoutResource, any, any> =>
      Models.CheckoutResource as Schema.Schema<Models.CheckoutResource, any, any>
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
export type CheckoutResponse = typeof CheckoutResponse.Type
