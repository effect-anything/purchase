import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutKlarnaPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session"))
})
export type CheckoutKlarnaPaymentMethodOptions = typeof CheckoutKlarnaPaymentMethodOptions.Type
