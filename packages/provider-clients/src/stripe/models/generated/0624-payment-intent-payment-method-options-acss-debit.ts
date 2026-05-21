import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsAcssDebit = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsMandateOptionsAcssDebit, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsMandateOptionsAcssDebit as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsMandateOptionsAcssDebit,
          any,
          any
        >
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
})
export type PaymentIntentPaymentMethodOptionsAcssDebit = typeof PaymentIntentPaymentMethodOptionsAcssDebit.Type
