import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend((): Schema.Schema<Models.SubscriptionResource> => Models.SubscriptionResource)),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type SubscriptionListResponse = typeof SubscriptionListResponse.Type
