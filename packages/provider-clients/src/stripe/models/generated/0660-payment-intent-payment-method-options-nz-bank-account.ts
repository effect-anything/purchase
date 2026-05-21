import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsNzBankAccount = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String)
})
export type PaymentIntentPaymentMethodOptionsNzBankAccount = typeof PaymentIntentPaymentMethodOptionsNzBankAccount.Type
