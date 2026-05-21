import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutUpiPaymentMethodOptions = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateOptionsUpi, any, any> =>
        Models.MandateOptionsUpi as Schema.Schema<Models.MandateOptionsUpi, any, any>
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session"))
})
export type CheckoutUpiPaymentMethodOptions = typeof CheckoutUpiPaymentMethodOptions.Type
