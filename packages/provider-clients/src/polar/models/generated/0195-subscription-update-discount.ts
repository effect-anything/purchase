import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateDiscount = Schema.Struct({
  discount_id: Schema.NullOr(Schema.String)
})
export type SubscriptionUpdateDiscount = typeof SubscriptionUpdateDiscount.Type
