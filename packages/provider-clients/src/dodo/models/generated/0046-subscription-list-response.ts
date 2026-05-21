import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.Subscription> => Models.Subscription)),
  total: Schema.optional(Schema.Number)
})
export type SubscriptionListResponse = typeof SubscriptionListResponse.Type
