import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsCard = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  installments: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodOptionsCardInstallments => Models.PaymentMethodOptionsCardInstallments)),
  mandate_options: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodOptionsCardMandateOptions => Models.PaymentMethodOptionsCardMandateOptions)),
  network: Schema.NullOr(Schema.Literal("amex", "cartes_bancaires", "diners", "discover", "eftpos_au", "girocard", "interac", "jcb", "link", "mastercard", "unionpay", "unknown", "visa")),
  request_extended_authorization: Schema.optional(Schema.Literal("if_available", "never")),
  request_incremental_authorization: Schema.optional(Schema.Literal("if_available", "never")),
  request_multicapture: Schema.optional(Schema.Literal("if_available", "never")),
  request_overcapture: Schema.optional(Schema.Literal("if_available", "never")),
  request_three_d_secure: Schema.NullOr(Schema.Literal("any", "automatic", "challenge")),
  require_cvc_recollection: Schema.optional(Schema.Boolean),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  statement_descriptor_suffix_kana: Schema.optional(Schema.String),
  statement_descriptor_suffix_kanji: Schema.optional(Schema.String),
})
export type PaymentIntentPaymentMethodOptionsCard = typeof PaymentIntentPaymentMethodOptionsCard.Type
