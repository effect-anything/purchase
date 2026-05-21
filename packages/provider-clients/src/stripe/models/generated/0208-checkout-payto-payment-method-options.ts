import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutPaytoPaymentMethodOptions = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateOptionsPayto, any, any> =>
        Models.MandateOptionsPayto as Schema.Schema<Models.MandateOptionsPayto, any, any>
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type CheckoutPaytoPaymentMethodOptions = typeof CheckoutPaytoPaymentMethodOptions.Type
