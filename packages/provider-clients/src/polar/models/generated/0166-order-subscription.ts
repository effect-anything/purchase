import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderSubscription = Schema.Struct({
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  amount: Schema.Number,
  currency: Schema.String,
  recurring_interval: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionRecurringInterval, any, any> =>
      Models.SubscriptionRecurringInterval as Schema.Schema<Models.SubscriptionRecurringInterval, any, any>
  ),
  recurring_interval_count: Schema.Number,
  status: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionStatus, any, any> =>
      Models.SubscriptionStatus as Schema.Schema<Models.SubscriptionStatus, any, any>
  ),
  current_period_start: Schema.String,
  current_period_end: Schema.String,
  trial_start: Schema.NullOr(Schema.String),
  trial_end: Schema.NullOr(Schema.String),
  cancel_at_period_end: Schema.Boolean,
  canceled_at: Schema.NullOr(Schema.String),
  started_at: Schema.NullOr(Schema.String),
  ends_at: Schema.NullOr(Schema.String),
  ended_at: Schema.NullOr(Schema.String),
  customer_id: Schema.String,
  product_id: Schema.String,
  discount_id: Schema.NullOr(Schema.String),
  checkout_id: Schema.NullOr(Schema.String),
  seats: Schema.optional(Schema.NullOr(Schema.Number)),
  customer_cancellation_reason: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerCancellationReason, any, any> =>
        Models.CustomerCancellationReason as Schema.Schema<Models.CustomerCancellationReason, any, any>
    )
  ),
  customer_cancellation_comment: Schema.NullOr(Schema.String)
})
export type OrderSubscription = typeof OrderSubscription.Type
