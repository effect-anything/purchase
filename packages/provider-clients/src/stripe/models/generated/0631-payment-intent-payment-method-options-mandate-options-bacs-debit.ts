import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsMandateOptionsBacsDebit = Schema.Struct({
  reference_prefix: Schema.optional(Schema.String),
})
export type PaymentIntentPaymentMethodOptionsMandateOptionsBacsDebit = typeof PaymentIntentPaymentMethodOptionsMandateOptionsBacsDebit.Type
