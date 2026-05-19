import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutBacsDebitPaymentMethodOptions = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.CheckoutPaymentMethodOptionsMandateOptionsBacsDebit => Models.CheckoutPaymentMethodOptionsMandateOptionsBacsDebit)),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
})
export type CheckoutBacsDebitPaymentMethodOptions = typeof CheckoutBacsDebitPaymentMethodOptions.Type
