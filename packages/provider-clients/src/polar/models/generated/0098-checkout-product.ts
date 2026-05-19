import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutProduct = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  trial_interval: Schema.NullOr(Schema.suspend((): typeof Models.TrialInterval => Models.TrialInterval)),
  trial_interval_count: Schema.NullOr(Schema.Number),
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  visibility: Schema.suspend((): typeof Models.ProductVisibility => Models.ProductVisibility),
  recurring_interval: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionRecurringInterval => Models.SubscriptionRecurringInterval)),
  recurring_interval_count: Schema.NullOr(Schema.Number),
  is_recurring: Schema.Boolean,
  is_archived: Schema.Boolean,
  organization_id: Schema.String,
  prices: Schema.Array(Schema.Union(Schema.suspend((): typeof Models.LegacyRecurringProductPrice => Models.LegacyRecurringProductPrice), Schema.suspend((): typeof Models.ProductPrice => Models.ProductPrice))),
  benefits: Schema.Array(Schema.suspend((): typeof Models.BenefitPublic => Models.BenefitPublic)),
  medias: Schema.Array(Schema.suspend((): typeof Models.ProductMediaFileRead => Models.ProductMediaFileRead)),
})
export type CheckoutProduct = typeof CheckoutProduct.Type
