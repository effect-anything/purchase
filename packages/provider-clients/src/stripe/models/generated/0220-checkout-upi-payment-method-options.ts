import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutUpiPaymentMethodOptions = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.MandateOptionsUpi => Models.MandateOptionsUpi)),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
})
export type CheckoutUpiPaymentMethodOptions = typeof CheckoutUpiPaymentMethodOptions.Type
