import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsSepaDebit = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit => Models.PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit)),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
})
export type PaymentIntentPaymentMethodOptionsSepaDebit = typeof PaymentIntentPaymentMethodOptionsSepaDebit.Type
