import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutAcssDebitMandateOptions = Schema.Struct({
  custom_mandate_url: Schema.optional(Schema.String),
  default_for: Schema.optional(Schema.Array(Schema.Literal("invoice", "subscription"))),
  interval_description: Schema.NullOr(Schema.String),
  payment_schedule: Schema.NullOr(Schema.Literal("combined", "interval", "sporadic")),
  transaction_type: Schema.NullOr(Schema.Literal("business", "personal")),
})
export type CheckoutAcssDebitMandateOptions = typeof CheckoutAcssDebitMandateOptions.Type
