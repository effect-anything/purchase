import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutPaypalPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  preferred_locale: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type CheckoutPaypalPaymentMethodOptions = typeof CheckoutPaypalPaymentMethodOptions.Type
