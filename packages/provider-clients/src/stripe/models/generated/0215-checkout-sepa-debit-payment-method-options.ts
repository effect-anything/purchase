import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSepaDebitPaymentMethodOptions = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutPaymentMethodOptionsMandateOptionsSepaDebit, any, any> =>
        Models.CheckoutPaymentMethodOptionsMandateOptionsSepaDebit as Schema.Schema<
          Models.CheckoutPaymentMethodOptionsMandateOptionsSepaDebit,
          any,
          any
        >
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String)
})
export type CheckoutSepaDebitPaymentMethodOptions = typeof CheckoutSepaDebitPaymentMethodOptions.Type
