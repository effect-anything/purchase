import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutPaymentMethodOptionsMandateOptionsBacsDebit = Schema.Struct({
  reference_prefix: Schema.optional(Schema.String),
})
export type CheckoutPaymentMethodOptionsMandateOptionsBacsDebit = typeof CheckoutPaymentMethodOptionsMandateOptionsBacsDebit.Type
