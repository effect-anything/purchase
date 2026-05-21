import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutProduct = Schema.Struct({
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
      (): Schema.Schema<Models.BenefitPublic, any, any> =>
        Models.BenefitPublic as Schema.Schema<Models.BenefitPublic, any, any>
    )
  ),
  medias: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.ProductMediaFileRead, any, any> =>
        Models.ProductMediaFileRead as Schema.Schema<Models.ProductMediaFileRead, any, any>
    )
  )
})
export type CheckoutProduct = typeof CheckoutProduct.Type
