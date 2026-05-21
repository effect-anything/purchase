import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerStateSubscription = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  custom_field_data: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String))
    })
  ),
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  status: Schema.Literal("active", "trialing"),
  amount: Schema.Number,
  currency: Schema.String,
  recurring_interval: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionRecurringInterval, any, any> =>
      Models.SubscriptionRecurringInterval as Schema.Schema<Models.SubscriptionRecurringInterval, any, any>
  ),
  current_period_start: Schema.String,
  current_period_end: Schema.String,
  trial_start: Schema.NullOr(Schema.String),
  trial_end: Schema.NullOr(Schema.String),
  cancel_at_period_end: Schema.Boolean,
  canceled_at: Schema.NullOr(Schema.String),
  started_at: Schema.NullOr(Schema.String),
  ends_at: Schema.NullOr(Schema.String),
  product_id: Schema.String,
  discount_id: Schema.NullOr(Schema.String),
  meters: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerStateSubscriptionMeter, any, any> =>
        Models.CustomerStateSubscriptionMeter as Schema.Schema<Models.CustomerStateSubscriptionMeter, any, any>
    )
  )
})
export type CustomerStateSubscription = typeof CustomerStateSubscription.Type
