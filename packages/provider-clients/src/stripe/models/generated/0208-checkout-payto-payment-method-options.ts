import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutPaytoPaymentMethodOptions = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.MandateOptionsPayto => Models.MandateOptionsPayto)),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})
export type CheckoutPaytoPaymentMethodOptions = typeof CheckoutPaytoPaymentMethodOptions.Type
