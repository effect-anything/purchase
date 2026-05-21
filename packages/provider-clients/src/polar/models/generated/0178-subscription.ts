import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Subscription = Schema.Struct({
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
  customer_cancellation_comment: Schema.NullOr(Schema.String),
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  custom_field_data: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String))
    })
  ),
  customer: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionCustomer, any, any> =>
      Models.SubscriptionCustomer as Schema.Schema<Models.SubscriptionCustomer, any, any>
  ),
  product: Schema.suspend(
    (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
  ),
  discount: Schema.NullOr(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.DiscountFixedOnceForeverDurationBase, any, any> =>
          Models.DiscountFixedOnceForeverDurationBase as Schema.Schema<
            Models.DiscountFixedOnceForeverDurationBase,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DiscountFixedRepeatDurationBase, any, any> =>
          Models.DiscountFixedRepeatDurationBase as Schema.Schema<Models.DiscountFixedRepeatDurationBase, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DiscountPercentageOnceForeverDurationBase, any, any> =>
          Models.DiscountPercentageOnceForeverDurationBase as Schema.Schema<
            Models.DiscountPercentageOnceForeverDurationBase,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DiscountPercentageRepeatDurationBase, any, any> =>
          Models.DiscountPercentageRepeatDurationBase as Schema.Schema<
            Models.DiscountPercentageRepeatDurationBase,
            any,
            any
          >
      )
    )
  ),
  prices: Schema.Array(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.LegacyRecurringProductPrice, any, any> =>
          Models.LegacyRecurringProductPrice as Schema.Schema<Models.LegacyRecurringProductPrice, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.ProductPrice, any, any> =>
          Models.ProductPrice as Schema.Schema<Models.ProductPrice, any, any>
      )
    )
  ),
  meters: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionMeter, any, any> =>
        Models.SubscriptionMeter as Schema.Schema<Models.SubscriptionMeter, any, any>
    )
  ),
  pending_update: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PendingSubscriptionUpdate, any, any> =>
        Models.PendingSubscriptionUpdate as Schema.Schema<Models.PendingSubscriptionUpdate, any, any>
    )
  )
})
export type Subscription = typeof Subscription.Type
