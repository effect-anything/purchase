import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsBancontact = Schema.Struct({
  preferred_language: Schema.Literal("de", "en", "fr", "nl"),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})
export type PaymentMethodOptionsBancontact = typeof PaymentMethodOptionsBancontact.Type
