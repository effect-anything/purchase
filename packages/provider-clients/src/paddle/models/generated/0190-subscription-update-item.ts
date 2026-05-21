import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateItem = Schema.Struct({
  price_id: Schema.suspend((): Schema.Schema<Models.PriceId> => Models.PriceId),
  quantity: Schema.optional(Schema.Number)
})
export type SubscriptionUpdateItem = typeof SubscriptionUpdateItem.Type
