import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsPayto = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsMandateOptionsPayto, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsMandateOptionsPayto as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsMandateOptionsPayto,
          any,
          any
        >
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type PaymentIntentPaymentMethodOptionsPayto = typeof PaymentIntentPaymentMethodOptionsPayto.Type
