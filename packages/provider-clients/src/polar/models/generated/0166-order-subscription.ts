import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderSubscription = Schema.Struct({
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  amount: Schema.Number,
  currency: Schema.String,
  recurring_interval: Schema.suspend((): typeof Models.SubscriptionRecurringInterval => Models.SubscriptionRecurringInterval),
  recurring_interval_count: Schema.Number,
  status: Schema.suspend((): typeof Models.SubscriptionStatus => Models.SubscriptionStatus),
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
  customer_cancellation_reason: Schema.NullOr(Schema.suspend((): typeof Models.CustomerCancellationReason => Models.CustomerCancellationReason)),
  customer_cancellation_comment: Schema.NullOr(Schema.String),
})
export type OrderSubscription = typeof OrderSubscription.Type
