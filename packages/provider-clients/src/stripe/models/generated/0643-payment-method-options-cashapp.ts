import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsCashapp = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
})
export type PaymentMethodOptionsCashapp = typeof PaymentMethodOptionsCashapp.Type
