import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutPublicConfirmed = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  custom_field_data: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String))
    })
  ),
  payment_processor: Schema.suspend(
    (): Schema.Schema<Models.PaymentProcessor, any, any> =>
      Models.PaymentProcessor as Schema.Schema<Models.PaymentProcessor, any, any>
  ),
  status: Schema.String,
  client_secret: Schema.String,
  url: Schema.String,
  expires_at: Schema.String,
  success_url: Schema.String,
  return_url: Schema.NullOr(Schema.String),
  embed_origin: Schema.NullOr(Schema.String),
  amount: Schema.Number,
  seats: Schema.optional(Schema.NullOr(Schema.Number)),
  min_seats: Schema.optional(Schema.NullOr(Schema.Number)),
  max_seats: Schema.optional(Schema.NullOr(Schema.Number)),
  discount_amount: Schema.Number,
  net_amount: Schema.Number,
  tax_amount: Schema.NullOr(Schema.Number),
  tax_behavior: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TaxBehavior, any, any> =>
        Models.TaxBehavior as Schema.Schema<Models.TaxBehavior, any, any>
    )
  ),
  total_amount: Schema.Number,
  currency: Schema.String,
  allow_trial: Schema.NullOr(Schema.Boolean),
  active_trial_interval: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TrialInterval, any, any> =>
        Models.TrialInterval as Schema.Schema<Models.TrialInterval, any, any>
    )
  ),
  active_trial_interval_count: Schema.NullOr(Schema.Number),
  trial_end: Schema.NullOr(Schema.String),
  organization_id: Schema.String,
  product_id: Schema.NullOr(Schema.String),
  product_price_id: Schema.NullOr(Schema.String),
  discount_id: Schema.NullOr(Schema.String),
  allow_discount_codes: Schema.Boolean,
  require_billing_address: Schema.Boolean,
  is_discount_applicable: Schema.Boolean,
  is_free_product_price: Schema.Boolean,
  is_payment_required: Schema.Boolean,
  is_payment_setup_required: Schema.Boolean,
  is_payment_form_required: Schema.Boolean,
  customer_id: Schema.NullOr(Schema.String),
  is_business_customer: Schema.Boolean,
  customer_name: Schema.NullOr(Schema.String),
  customer_email: Schema.NullOr(Schema.String),
  customer_ip_address: Schema.NullOr(Schema.String),
  customer_billing_name: Schema.NullOr(Schema.String),
  customer_billing_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  customer_tax_id: Schema.NullOr(Schema.String),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  payment_processor_metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  billing_address_fields: Schema.suspend(
    (): Schema.Schema<Models.CheckoutBillingAddressFields, any, any> =>
      Models.CheckoutBillingAddressFields as Schema.Schema<Models.CheckoutBillingAddressFields, any, any>
  ),
  products: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutProduct, any, any> =>
        Models.CheckoutProduct as Schema.Schema<Models.CheckoutProduct, any, any>
    )
  ),
  product: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutProduct, any, any> =>
        Models.CheckoutProduct as Schema.Schema<Models.CheckoutProduct, any, any>
    )
  ),
  product_price: Schema.NullOr(
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
  prices: Schema.NullOr(
    Schema.Record({
      key: Schema.String,
      value: Schema.Array(
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
      )
    })
  ),
  discount: Schema.NullOr(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.CheckoutDiscountFixedOnceForeverDuration, any, any> =>
          Models.CheckoutDiscountFixedOnceForeverDuration as Schema.Schema<
            Models.CheckoutDiscountFixedOnceForeverDuration,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.CheckoutDiscountFixedRepeatDuration, any, any> =>
          Models.CheckoutDiscountFixedRepeatDuration as Schema.Schema<
            Models.CheckoutDiscountFixedRepeatDuration,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.CheckoutDiscountPercentageOnceForeverDuration, any, any> =>
          Models.CheckoutDiscountPercentageOnceForeverDuration as Schema.Schema<
            Models.CheckoutDiscountPercentageOnceForeverDuration,
            any,
            any
          >
      ),
      Schema.suspend(
        (): Schema.Schema<Models.CheckoutDiscountPercentageRepeatDuration, any, any> =>
          Models.CheckoutDiscountPercentageRepeatDuration as Schema.Schema<
            Models.CheckoutDiscountPercentageRepeatDuration,
            any,
            any
          >
      )
    )
  ),
  organization: Schema.suspend(
    (): Schema.Schema<Models.CheckoutOrganization, any, any> =>
      Models.CheckoutOrganization as Schema.Schema<Models.CheckoutOrganization, any, any>
  ),
  attached_custom_fields: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.AttachedCustomField, any, any> =>
          Models.AttachedCustomField as Schema.Schema<Models.AttachedCustomField, any, any>
      )
    )
  ),
  customer_session_token: Schema.NullOr(Schema.String)
})
export type CheckoutPublicConfirmed = typeof CheckoutPublicConfirmed.Type
