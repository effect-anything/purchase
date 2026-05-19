import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionResponse = Schema.Struct({
  data: Schema.suspend(() => Models.SubscriptionResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type SubscriptionResponse = typeof SubscriptionResponse.Type
