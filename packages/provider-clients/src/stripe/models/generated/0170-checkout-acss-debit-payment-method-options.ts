import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutAcssDebitPaymentMethodOptions = Schema.Struct({
  currency: Schema.optional(Schema.Literal("cad", "usd")),
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.CheckoutAcssDebitMandateOptions => Models.CheckoutAcssDebitMandateOptions)),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits")),
})
export type CheckoutAcssDebitPaymentMethodOptions = typeof CheckoutAcssDebitPaymentMethodOptions.Type
