import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsBoleto = Schema.Struct({
  expires_after_days: Schema.Number,
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session"))
})
export type PaymentMethodOptionsBoleto = typeof PaymentMethodOptionsBoleto.Type
