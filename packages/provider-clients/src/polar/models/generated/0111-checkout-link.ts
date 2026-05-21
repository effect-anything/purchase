import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutLink = Schema.Struct({
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
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  payment_processor: Schema.suspend(
    (): Schema.Schema<Models.PaymentProcessor, any, any> =>
      Models.PaymentProcessor as Schema.Schema<Models.PaymentProcessor, any, any>
  ),
  client_secret: Schema.String,
  success_url: Schema.NullOr(Schema.String),
  return_url: Schema.NullOr(Schema.String),
  label: Schema.NullOr(Schema.String),
  allow_discount_codes: Schema.Boolean,
  require_billing_address: Schema.Boolean,
  discount_id: Schema.NullOr(Schema.String),
  organization_id: Schema.String,
  products: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutLinkProduct, any, any> =>
        Models.CheckoutLinkProduct as Schema.Schema<Models.CheckoutLinkProduct, any, any>
    )
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
  url: Schema.String
})
export type CheckoutLink = typeof CheckoutLink.Type
