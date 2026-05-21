import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionPaymentMethodOptionsMandateOptionsPix = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  amount_includes_iof: Schema.NullOr(Schema.Literal("always", "never")),
  end_date: Schema.NullOr(Schema.String),
  payment_schedule: Schema.NullOr(Schema.Literal("halfyearly", "monthly", "quarterly", "weekly", "yearly"))
})
export type SubscriptionPaymentMethodOptionsMandateOptionsPix =
  typeof SubscriptionPaymentMethodOptionsMandateOptionsPix.Type
