import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSession = Schema.Struct({
  adaptive_pricing: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionAdaptivePricing, any, any> =>
        Models.PaymentPagesCheckoutSessionAdaptivePricing as Schema.Schema<
          Models.PaymentPagesCheckoutSessionAdaptivePricing,
          any,
          any
        >
    )
  ),
  after_expiration: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionAfterExpiration, any, any> =>
        Models.PaymentPagesCheckoutSessionAfterExpiration as Schema.Schema<
          Models.PaymentPagesCheckoutSessionAfterExpiration,
          any,
          any
        >
    )
  ),
  allow_promotion_codes: Schema.NullOr(Schema.Boolean),
  amount_subtotal: Schema.NullOr(Schema.Number),
  amount_total: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.suspend(
    (): Schema.Schema<Models.PaymentPagesCheckoutSessionAutomaticTax, any, any> =>
      Models.PaymentPagesCheckoutSessionAutomaticTax as Schema.Schema<
        Models.PaymentPagesCheckoutSessionAutomaticTax,
        any,
        any
      >
  ),
  billing_address_collection: Schema.NullOr(Schema.Literal("auto", "required")),
  branding_settings: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionBrandingSettings, any, any> =>
        Models.PaymentPagesCheckoutSessionBrandingSettings as Schema.Schema<
          Models.PaymentPagesCheckoutSessionBrandingSettings,
          any,
          any
        >
    )
  ),
  cancel_url: Schema.NullOr(Schema.String),
  client_reference_id: Schema.NullOr(Schema.String),
  client_secret: Schema.NullOr(Schema.String),
  collected_information: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCollectedInformation, any, any> =>
        Models.PaymentPagesCheckoutSessionCollectedInformation as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCollectedInformation,
          any,
          any
        >
    )
  ),
  consent: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionConsent, any, any> =>
        Models.PaymentPagesCheckoutSessionConsent as Schema.Schema<Models.PaymentPagesCheckoutSessionConsent, any, any>
    )
  ),
  consent_collection: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionConsentCollection, any, any> =>
        Models.PaymentPagesCheckoutSessionConsentCollection as Schema.Schema<
          Models.PaymentPagesCheckoutSessionConsentCollection,
          any,
          any
        >
    )
  ),
  created: Schema.Number,
  currency: Schema.NullOr(Schema.String),
  currency_conversion: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCurrencyConversion, any, any> =>
        Models.PaymentPagesCheckoutSessionCurrencyConversion as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCurrencyConversion,
          any,
          any
        >
    )
  ),
  custom_fields: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomFields, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomFields as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomFields,
          any,
          any
        >
    )
  ),
  custom_text: Schema.suspend(
    (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomText, any, any> =>
      Models.PaymentPagesCheckoutSessionCustomText as Schema.Schema<
        Models.PaymentPagesCheckoutSessionCustomText,
        any,
        any
      >
  ),
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedCustomer, any, any> =>
          Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  customer_creation: Schema.NullOr(Schema.Literal("always", "if_required")),
  customer_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomerDetails, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomerDetails as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomerDetails,
          any,
          any
        >
    )
  ),
  customer_email: Schema.NullOr(Schema.String),
  discounts: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PaymentPagesCheckoutSessionDiscount, any, any> =>
          Models.PaymentPagesCheckoutSessionDiscount as Schema.Schema<
            Models.PaymentPagesCheckoutSessionDiscount,
            any,
            any
          >
      )
    )
  ),
  excluded_payment_method_types: Schema.optional(Schema.Array(Schema.String)),
  expires_at: Schema.Number,
  id: Schema.String,
  integration_identifier: Schema.NullOr(Schema.String),
  invoice: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
      )
    )
  ),
  invoice_creation: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionInvoiceCreation, any, any> =>
        Models.PaymentPagesCheckoutSessionInvoiceCreation as Schema.Schema<
          Models.PaymentPagesCheckoutSessionInvoiceCreation,
          any,
          any
        >
    )
  ),
  line_items: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend((): Schema.Schema<Models.Item, any, any> => Models.Item as Schema.Schema<Models.Item, any, any>)
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  livemode: Schema.Boolean,
  locale: Schema.NullOr(
    Schema.Literal(
      "auto",
      "bg",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "en-GB",
      "es",
      "es-419",
      "et",
      "fi",
      "fil",
      "fr",
      "fr-CA",
      "hr",
      "hu",
      "id",
      "it",
      "ja",
      "ko",
      "lt",
      "lv",
      "ms",
      "mt",
      "nb",
      "nl",
      "pl",
      "pt",
      "pt-BR",
      "ro",
      "ru",
      "sk",
      "sl",
      "sv",
      "th",
      "tr",
      "vi",
      "zh",
      "zh-HK",
      "zh-TW"
    )
  ),
  managed_payments: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionManagedPayments, any, any> =>
        Models.PaymentPagesCheckoutSessionManagedPayments as Schema.Schema<
          Models.PaymentPagesCheckoutSessionManagedPayments,
          any,
          any
        >
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  mode: Schema.Literal("payment", "setup", "subscription"),
  name_collection: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionNameCollection, any, any> =>
        Models.PaymentPagesCheckoutSessionNameCollection as Schema.Schema<
          Models.PaymentPagesCheckoutSessionNameCollection,
          any,
          any
        >
    )
  ),
  object: Schema.Literal("checkout.session"),
  optional_items: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.PaymentPagesCheckoutSessionOptionalItem, any, any> =>
            Models.PaymentPagesCheckoutSessionOptionalItem as Schema.Schema<
              Models.PaymentPagesCheckoutSessionOptionalItem,
              any,
              any
            >
        )
      )
    )
  ),
  origin_context: Schema.NullOr(Schema.Literal("mobile_app", "web")),
  payment_intent: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentIntent, any, any> =>
          Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
      )
    )
  ),
  payment_link: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentLink, any, any> =>
          Models.PaymentLink as Schema.Schema<Models.PaymentLink, any, any>
      )
    )
  ),
  payment_method_collection: Schema.NullOr(Schema.Literal("always", "if_required")),
  payment_method_configuration_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails, any, any> =>
        Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails as Schema.Schema<
          Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails,
          any,
          any
        >
    )
  ),
  payment_method_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSessionPaymentMethodOptions, any, any> =>
        Models.CheckoutSessionPaymentMethodOptions as Schema.Schema<
          Models.CheckoutSessionPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  payment_method_types: Schema.Array(Schema.String),
  payment_status: Schema.Literal("no_payment_required", "paid", "unpaid"),
  permissions: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionPermissions, any, any> =>
        Models.PaymentPagesCheckoutSessionPermissions as Schema.Schema<
          Models.PaymentPagesCheckoutSessionPermissions,
          any,
          any
        >
    )
  ),
  phone_number_collection: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionPhoneNumberCollection, any, any> =>
        Models.PaymentPagesCheckoutSessionPhoneNumberCollection as Schema.Schema<
          Models.PaymentPagesCheckoutSessionPhoneNumberCollection,
          any,
          any
        >
    )
  ),
  presentment_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentIntentPresentmentDetails, any, any> =>
        Models.PaymentFlowsPaymentIntentPresentmentDetails as Schema.Schema<
          Models.PaymentFlowsPaymentIntentPresentmentDetails,
          any,
          any
        >
    )
  ),
  recovered_from: Schema.NullOr(Schema.String),
  redirect_on_completion: Schema.optional(Schema.Literal("always", "if_required", "never")),
  return_url: Schema.optional(Schema.String),
  saved_payment_method_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionSavedPaymentMethodOptions, any, any> =>
        Models.PaymentPagesCheckoutSessionSavedPaymentMethodOptions as Schema.Schema<
          Models.PaymentPagesCheckoutSessionSavedPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  setup_intent: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SetupIntent, any, any> =>
          Models.SetupIntent as Schema.Schema<Models.SetupIntent, any, any>
      )
    )
  ),
  shipping_address_collection: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionShippingAddressCollection, any, any> =>
        Models.PaymentPagesCheckoutSessionShippingAddressCollection as Schema.Schema<
          Models.PaymentPagesCheckoutSessionShippingAddressCollection,
          any,
          any
        >
    )
  ),
  shipping_cost: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionShippingCost, any, any> =>
        Models.PaymentPagesCheckoutSessionShippingCost as Schema.Schema<
          Models.PaymentPagesCheckoutSessionShippingCost,
          any,
          any
        >
    )
  ),
  shipping_options: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionShippingOption, any, any> =>
        Models.PaymentPagesCheckoutSessionShippingOption as Schema.Schema<
          Models.PaymentPagesCheckoutSessionShippingOption,
          any,
          any
        >
    )
  ),
  status: Schema.NullOr(Schema.Literal("complete", "expired", "open")),
  submit_type: Schema.NullOr(Schema.Literal("auto", "book", "donate", "pay", "subscribe")),
  subscription: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Subscription, any, any> =>
          Models.Subscription as Schema.Schema<Models.Subscription, any, any>
      )
    )
  ),
  success_url: Schema.NullOr(Schema.String),
  tax_id_collection: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionTaxIdCollection, any, any> =>
        Models.PaymentPagesCheckoutSessionTaxIdCollection as Schema.Schema<
          Models.PaymentPagesCheckoutSessionTaxIdCollection,
          any,
          any
        >
    )
  ),
  total_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionTotalDetails, any, any> =>
        Models.PaymentPagesCheckoutSessionTotalDetails as Schema.Schema<
          Models.PaymentPagesCheckoutSessionTotalDetails,
          any,
          any
        >
    )
  ),
  ui_mode: Schema.NullOr(Schema.Literal("elements", "embedded_page", "form", "hosted_page")),
  url: Schema.NullOr(Schema.String),
  wallet_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSessionWalletOptions, any, any> =>
        Models.CheckoutSessionWalletOptions as Schema.Schema<Models.CheckoutSessionWalletOptions, any, any>
    )
  )
})
export type CheckoutSession = typeof CheckoutSession.Type
