import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsLink = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  persistent_token: Schema.NullOr(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})
export type PaymentIntentPaymentMethodOptionsLink = typeof PaymentIntentPaymentMethodOptionsLink.Type
