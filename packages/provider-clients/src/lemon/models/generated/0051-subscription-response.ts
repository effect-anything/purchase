import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResponse = Schema.Struct({
  data: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionResource, any, any> =>
      Models.SubscriptionResource as Schema.Schema<Models.SubscriptionResource, any, any>
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
export type SubscriptionResponse = typeof SubscriptionResponse.Type
