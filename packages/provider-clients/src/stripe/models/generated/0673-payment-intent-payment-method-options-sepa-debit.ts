import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsSepaDebit = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit,
          any,
          any
        >
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String)
})
export type PaymentIntentPaymentMethodOptionsSepaDebit = typeof PaymentIntentPaymentMethodOptionsSepaDebit.Type
