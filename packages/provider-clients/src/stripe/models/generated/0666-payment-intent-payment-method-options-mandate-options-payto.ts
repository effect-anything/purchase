import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsMandateOptionsPayto = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  amount_type: Schema.NullOr(Schema.Literal("fixed", "maximum")),
  end_date: Schema.NullOr(Schema.String),
  payment_schedule: Schema.NullOr(
    Schema.Literal("adhoc", "annual", "daily", "fortnightly", "monthly", "quarterly", "semi_annual", "weekly")
  ),
  payments_per_period: Schema.NullOr(Schema.Number),
  purpose: Schema.NullOr(
    Schema.Literal(
      "dependant_support",
      "government",
      "loan",
      "mortgage",
      "other",
      "pension",
      "personal",
      "retail",
      "salary",
      "tax",
      "utility"
    )
  )
})
export type PaymentIntentPaymentMethodOptionsMandateOptionsPayto =
  typeof PaymentIntentPaymentMethodOptionsMandateOptionsPayto.Type
