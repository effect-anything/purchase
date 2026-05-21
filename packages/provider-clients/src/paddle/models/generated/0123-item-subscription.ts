import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ItemSubscription = Schema.Struct({
  status: Schema.suspend((): Schema.Schema<Models.ItemSubscriptionStatus> => Models.ItemSubscriptionStatus),
  quantity: Schema.Number,
  recurring: Schema.Boolean,
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  previously_billed_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  next_billed_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  trial_dates: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TimePeriod> => Models.TimePeriod)),
  price: Schema.suspend((): Schema.Schema<Models.Price> => Models.Price),
  product: Schema.suspend((): Schema.Schema<Models.Product> => Models.Product)
})
export type ItemSubscription = typeof ItemSubscription.Type
