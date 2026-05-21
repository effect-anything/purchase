import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ItemSubscription = Schema.Struct({
  status: Schema.suspend(
    (): Schema.Schema<Models.ItemSubscriptionStatus, any, any> =>
      Models.ItemSubscriptionStatus as Schema.Schema<Models.ItemSubscriptionStatus, any, any>
  ),
  quantity: Schema.Number,
  recurring: Schema.Boolean,
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  previously_billed_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  next_billed_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  trial_dates: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TimePeriod, any, any> => Models.TimePeriod as Schema.Schema<Models.TimePeriod, any, any>
    )
  ),
  price: Schema.suspend(
    (): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>
  ),
  product: Schema.suspend(
    (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
  )
})
export type ItemSubscription = typeof ItemSubscription.Type
