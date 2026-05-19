import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsKlarna = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  preferred_locale: Schema.NullOr(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
})
export type PaymentMethodOptionsKlarna = typeof PaymentMethodOptionsKlarna.Type
