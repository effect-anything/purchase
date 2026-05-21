import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutCardPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  installments: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutCardInstallmentsOptions, any, any> =>
        Models.CheckoutCardInstallmentsOptions as Schema.Schema<Models.CheckoutCardInstallmentsOptions, any, any>
    )
  ),
  request_extended_authorization: Schema.optional(Schema.Literal("if_available", "never")),
  request_incremental_authorization: Schema.optional(Schema.Literal("if_available", "never")),
  request_multicapture: Schema.optional(Schema.Literal("if_available", "never")),
  request_overcapture: Schema.optional(Schema.Literal("if_available", "never")),
  request_three_d_secure: Schema.Literal("any", "automatic", "challenge"),
  restrictions: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesPrivateCardPaymentMethodOptionsResourceRestrictions, any, any> =>
        Models.PaymentPagesPrivateCardPaymentMethodOptionsResourceRestrictions as Schema.Schema<
          Models.PaymentPagesPrivateCardPaymentMethodOptionsResourceRestrictions,
          any,
          any
        >
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  statement_descriptor_suffix_kana: Schema.optional(Schema.String),
  statement_descriptor_suffix_kanji: Schema.optional(Schema.String)
})
export type CheckoutCardPaymentMethodOptions = typeof CheckoutCardPaymentMethodOptions.Type
