import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLink = Schema.Struct({
  active: Schema.Boolean,
  after_completion: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceAfterCompletion, any, any> =>
      Models.PaymentLinksResourceAfterCompletion as Schema.Schema<Models.PaymentLinksResourceAfterCompletion, any, any>
  ),
  allow_promotion_codes: Schema.Boolean,
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedApplication, any, any> =>
          Models.DeletedApplication as Schema.Schema<Models.DeletedApplication, any, any>
      )
    )
  ),
  application_fee_amount: Schema.NullOr(Schema.Number),
  application_fee_percent: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceAutomaticTax, any, any> =>
      Models.PaymentLinksResourceAutomaticTax as Schema.Schema<Models.PaymentLinksResourceAutomaticTax, any, any>
  ),
  billing_address_collection: Schema.Literal("auto", "required"),
  consent_collection: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceConsentCollection, any, any> =>
        Models.PaymentLinksResourceConsentCollection as Schema.Schema<
          Models.PaymentLinksResourceConsentCollection,
          any,
          any
        >
    )
  ),
  currency: Schema.String,
  custom_fields: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomFields, any, any> =>
        Models.PaymentLinksResourceCustomFields as Schema.Schema<Models.PaymentLinksResourceCustomFields, any, any>
    )
  ),
  custom_text: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceCustomText, any, any> =>
      Models.PaymentLinksResourceCustomText as Schema.Schema<Models.PaymentLinksResourceCustomText, any, any>
  ),
  customer_creation: Schema.Literal("always", "if_required"),
  id: Schema.String,
  inactive_message: Schema.NullOr(Schema.String),
  invoice_creation: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceInvoiceCreation, any, any> =>
        Models.PaymentLinksResourceInvoiceCreation as Schema.Schema<
          Models.PaymentLinksResourceInvoiceCreation,
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
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name_collection: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceNameCollection, any, any> =>
        Models.PaymentLinksResourceNameCollection as Schema.Schema<Models.PaymentLinksResourceNameCollection, any, any>
    )
  ),
  object: Schema.Literal("payment_link"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  optional_items: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.PaymentLinksResourceOptionalItem, any, any> =>
            Models.PaymentLinksResourceOptionalItem as Schema.Schema<Models.PaymentLinksResourceOptionalItem, any, any>
        )
      )
    )
  ),
  payment_intent_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourcePaymentIntentData, any, any> =>
        Models.PaymentLinksResourcePaymentIntentData as Schema.Schema<
          Models.PaymentLinksResourcePaymentIntentData,
          any,
          any
        >
    )
  ),
  payment_method_collection: Schema.Literal("always", "if_required"),
  payment_method_types: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "affirm",
        "afterpay_clearpay",
        "alipay",
        "alma",
        "au_becs_debit",
        "bacs_debit",
        "bancontact",
        "billie",
        "blik",
        "boleto",
        "card",
        "cashapp",
        "eps",
        "fpx",
        "giropay",
        "grabpay",
        "ideal",
        "klarna",
        "konbini",
        "link",
        "mb_way",
        "mobilepay",
        "multibanco",
        "oxxo",
        "p24",
        "pay_by_bank",
        "paynow",
        "paypal",
        "payto",
        "pix",
        "promptpay",
        "satispay",
        "sepa_debit",
        "sofort",
        "sunbit",
        "swish",
        "twint",
        "upi",
        "us_bank_account",
        "wechat_pay",
        "zip"
      )
    )
  ),
  phone_number_collection: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourcePhoneNumberCollection, any, any> =>
      Models.PaymentLinksResourcePhoneNumberCollection as Schema.Schema<
        Models.PaymentLinksResourcePhoneNumberCollection,
        any,
        any
      >
  ),
  restrictions: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceRestrictions, any, any> =>
        Models.PaymentLinksResourceRestrictions as Schema.Schema<Models.PaymentLinksResourceRestrictions, any, any>
    )
  ),
  shipping_address_collection: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceShippingAddressCollection, any, any> =>
        Models.PaymentLinksResourceShippingAddressCollection as Schema.Schema<
          Models.PaymentLinksResourceShippingAddressCollection,
          any,
          any
        >
    )
  ),
  shipping_options: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceShippingOption, any, any> =>
        Models.PaymentLinksResourceShippingOption as Schema.Schema<Models.PaymentLinksResourceShippingOption, any, any>
    )
  ),
  submit_type: Schema.Literal("auto", "book", "donate", "pay", "subscribe"),
  subscription_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceSubscriptionData, any, any> =>
        Models.PaymentLinksResourceSubscriptionData as Schema.Schema<
          Models.PaymentLinksResourceSubscriptionData,
          any,
          any
        >
    )
  ),
  tax_id_collection: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceTaxIdCollection, any, any> =>
      Models.PaymentLinksResourceTaxIdCollection as Schema.Schema<Models.PaymentLinksResourceTaxIdCollection, any, any>
  ),
  transfer_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceTransferData, any, any> =>
        Models.PaymentLinksResourceTransferData as Schema.Schema<Models.PaymentLinksResourceTransferData, any, any>
    )
  ),
  url: Schema.String
})
export type PaymentLink = typeof PaymentLink.Type
