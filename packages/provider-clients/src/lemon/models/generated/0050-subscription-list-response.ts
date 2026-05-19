import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.SubscriptionResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type SubscriptionListResponse = typeof SubscriptionListResponse.Type
