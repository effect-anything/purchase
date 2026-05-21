import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResource = Schema.Struct({
  type: Schema.Literal("subscriptions"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionAttributes, any, any> =>
      Models.SubscriptionAttributes as Schema.Schema<Models.SubscriptionAttributes, any, any>
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
export type SubscriptionResource = typeof SubscriptionResource.Type
