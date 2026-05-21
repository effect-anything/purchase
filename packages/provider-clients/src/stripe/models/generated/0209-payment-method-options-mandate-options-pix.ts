import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsMandateOptionsPix = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  amount_includes_iof: Schema.optional(Schema.Literal("always", "never")),
  amount_type: Schema.optional(Schema.Literal("fixed", "maximum")),
  currency: Schema.optional(Schema.String),
  end_date: Schema.optional(Schema.String),
  payment_schedule: Schema.optional(Schema.Literal("halfyearly", "monthly", "quarterly", "weekly", "yearly")),
  reference: Schema.optional(Schema.String),
  start_date: Schema.optional(Schema.String)
})
export type PaymentMethodOptionsMandateOptionsPix = typeof PaymentMethodOptionsMandateOptionsPix.Type
