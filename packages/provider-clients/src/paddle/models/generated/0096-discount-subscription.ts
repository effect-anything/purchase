import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountSubscription = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.DiscountId> => Models.DiscountId),
  starts_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  ends_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp))
})
export type DiscountSubscription = typeof DiscountSubscription.Type
