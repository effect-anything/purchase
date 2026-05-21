import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit = Schema.Struct({
  reference_prefix: Schema.optional(Schema.String)
})
export type PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit =
  typeof PaymentIntentPaymentMethodOptionsMandateOptionsSepaDebit.Type
