import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResource = Schema.Struct({
  type: Schema.Literal("subscriptions"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.SubscriptionAttributes> => Models.SubscriptionAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type SubscriptionResource = typeof SubscriptionResource.Type
