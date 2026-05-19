import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsPix = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodOptionsMandateOptionsPix => Models.PaymentMethodOptionsMandateOptionsPix)),
})
export type SetupIntentPaymentMethodOptionsPix = typeof SetupIntentPaymentMethodOptionsPix.Type
