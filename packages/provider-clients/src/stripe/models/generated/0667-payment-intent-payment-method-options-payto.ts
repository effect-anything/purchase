import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsPayto = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentPaymentMethodOptionsMandateOptionsPayto => Models.PaymentIntentPaymentMethodOptionsMandateOptionsPayto)),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})
export type PaymentIntentPaymentMethodOptionsPayto = typeof PaymentIntentPaymentMethodOptionsPayto.Type
