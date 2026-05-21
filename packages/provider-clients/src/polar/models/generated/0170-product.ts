import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Product = Schema.Struct({
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
  organization_id: Schema.String,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
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
  benefits: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Benefit, any, any> => Models.Benefit as Schema.Schema<Models.Benefit, any, any>
    )
  ),
  medias: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.ProductMediaFileRead, any, any> =>
        Models.ProductMediaFileRead as Schema.Schema<Models.ProductMediaFileRead, any, any>
    )
  ),
  attached_custom_fields: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.AttachedCustomField, any, any> =>
        Models.AttachedCustomField as Schema.Schema<Models.AttachedCustomField, any, any>
    )
  )
})
export type Product = typeof Product.Type
