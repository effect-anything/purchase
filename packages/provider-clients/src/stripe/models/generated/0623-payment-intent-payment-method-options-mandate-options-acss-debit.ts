import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsMandateOptionsAcssDebit = Schema.Struct({
  custom_mandate_url: Schema.optional(Schema.String),
  interval_description: Schema.NullOr(Schema.String),
  payment_schedule: Schema.NullOr(Schema.Literal("combined", "interval", "sporadic")),
  transaction_type: Schema.NullOr(Schema.Literal("business", "personal"))
})
export type PaymentIntentPaymentMethodOptionsMandateOptionsAcssDebit =
  typeof PaymentIntentPaymentMethodOptionsMandateOptionsAcssDebit.Type
