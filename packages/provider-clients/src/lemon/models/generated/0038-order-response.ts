import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderResponse = Schema.Struct({
  data: Schema.suspend(
    (): Schema.Schema<Models.OrderResource, any, any> =>
      Models.OrderResource as Schema.Schema<Models.OrderResource, any, any>
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
export type OrderResponse = typeof OrderResponse.Type
