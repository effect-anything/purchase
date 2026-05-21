import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.SubscriptionResource> => Models.SubscriptionResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type SubscriptionResponse = typeof SubscriptionResponse.Type
