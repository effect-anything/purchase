import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionResource = Schema.Struct({
  type: Schema.Literal("subscriptions"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.SubscriptionAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type SubscriptionResource = typeof SubscriptionResource.Type
