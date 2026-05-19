import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutLink = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  trial_interval: Schema.NullOr(Schema.suspend((): typeof Models.TrialInterval => Models.TrialInterval)),
  trial_interval_count: Schema.NullOr(Schema.Number),
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  payment_processor: Schema.suspend((): typeof Models.PaymentProcessor => Models.PaymentProcessor),
  client_secret: Schema.String,
  success_url: Schema.NullOr(Schema.String),
  return_url: Schema.NullOr(Schema.String),
  label: Schema.NullOr(Schema.String),
  allow_discount_codes: Schema.Boolean,
  require_billing_address: Schema.Boolean,
  discount_id: Schema.NullOr(Schema.String),
  organization_id: Schema.String,
  products: Schema.Array(Schema.suspend((): typeof Models.CheckoutLinkProduct => Models.CheckoutLinkProduct)),
  discount: Schema.NullOr(Schema.Union(Schema.suspend((): typeof Models.DiscountFixedOnceForeverDurationBase => Models.DiscountFixedOnceForeverDurationBase), Schema.suspend((): typeof Models.DiscountFixedRepeatDurationBase => Models.DiscountFixedRepeatDurationBase), Schema.suspend((): typeof Models.DiscountPercentageOnceForeverDurationBase => Models.DiscountPercentageOnceForeverDurationBase), Schema.suspend((): typeof Models.DiscountPercentageRepeatDurationBase => Models.DiscountPercentageRepeatDurationBase))),
  url: Schema.String,
})
export type CheckoutLink = typeof CheckoutLink.Type
