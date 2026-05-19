import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MandateAcssDebit = Schema.Struct({
  default_for: Schema.optional(Schema.Array(Schema.Literal("invoice", "subscription"))),
  interval_description: Schema.NullOr(Schema.String),
  payment_schedule: Schema.Literal("combined", "interval", "sporadic"),
  transaction_type: Schema.Literal("business", "personal"),
})
export type MandateAcssDebit = typeof MandateAcssDebit.Type
