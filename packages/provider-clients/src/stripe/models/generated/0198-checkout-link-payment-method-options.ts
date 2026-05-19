import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutLinkPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})
export type CheckoutLinkPaymentMethodOptions = typeof CheckoutLinkPaymentMethodOptions.Type
