import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsSofort = Schema.Struct({
  preferred_language: Schema.NullOr(Schema.Literal("de", "en", "es", "fr", "it", "nl", "pl")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type PaymentMethodOptionsSofort = typeof PaymentMethodOptionsSofort.Type
