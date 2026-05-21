import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderProduct = Schema.Struct({
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  trial_interval: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TrialInterval, any, any> =>
        Models.TrialInterval as Schema.Schema<Models.TrialInterval, any, any>
    )
  ),
  trial_interval_count: Schema.NullOr(Schema.Number),
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  visibility: Schema.suspend(
    (): Schema.Schema<Models.ProductVisibility, any, any> =>
      Models.ProductVisibility as Schema.Schema<Models.ProductVisibility, any, any>
  ),
  recurring_interval: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionRecurringInterval, any, any> =>
        Models.SubscriptionRecurringInterval as Schema.Schema<Models.SubscriptionRecurringInterval, any, any>
    )
  ),
  recurring_interval_count: Schema.NullOr(Schema.Number),
  is_recurring: Schema.Boolean,
  is_archived: Schema.Boolean,
  organization_id: Schema.String
})
export type OrderProduct = typeof OrderProduct.Type
