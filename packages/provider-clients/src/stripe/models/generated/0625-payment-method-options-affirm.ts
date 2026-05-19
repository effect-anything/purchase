import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsAffirm = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  preferred_locale: Schema.optional(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type PaymentMethodOptionsAffirm = typeof PaymentMethodOptionsAffirm.Type
