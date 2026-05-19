import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsKonbini = Schema.Struct({
  confirmation_number: Schema.NullOr(Schema.String),
  expires_after_days: Schema.NullOr(Schema.Number),
  expires_at: Schema.NullOr(Schema.Number),
  product_description: Schema.NullOr(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type PaymentMethodOptionsKonbini = typeof PaymentMethodOptionsKonbini.Type
