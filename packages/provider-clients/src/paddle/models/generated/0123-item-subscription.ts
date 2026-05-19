import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ItemSubscription = Schema.Struct({
  status: Schema.suspend(() => Models.ItemSubscriptionStatus),
  quantity: Schema.Number,
  recurring: Schema.Boolean,
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  previously_billed_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  next_billed_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  trial_dates: Schema.NullOr(Schema.suspend(() => Models.TimePeriod)),
  price: Schema.suspend(() => Models.Price),
  product: Schema.suspend(() => Models.Product),
})
export type ItemSubscription = typeof ItemSubscription.Type
