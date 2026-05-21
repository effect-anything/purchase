import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutPixPaymentMethodOptions = Schema.Struct({
  amount_includes_iof: Schema.optional(Schema.Literal("always", "never")),
  expires_after_seconds: Schema.NullOr(Schema.Number),
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsMandateOptionsPix, any, any> =>
        Models.PaymentMethodOptionsMandateOptionsPix as Schema.Schema<
          Models.PaymentMethodOptionsMandateOptionsPix,
          any,
          any
        >
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type CheckoutPixPaymentMethodOptions = typeof CheckoutPixPaymentMethodOptions.Type
