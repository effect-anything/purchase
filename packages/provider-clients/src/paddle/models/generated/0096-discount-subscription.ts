import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountSubscription = Schema.Struct({
  id: Schema.suspend(() => Models.DiscountId),
  starts_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  ends_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
})
export type DiscountSubscription = typeof DiscountSubscription.Type
