import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsUpi = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodOptionsMandateOptionsUpi => Models.PaymentMethodOptionsMandateOptionsUpi)),
})
export type SetupIntentPaymentMethodOptionsUpi = typeof SetupIntentPaymentMethodOptionsUpi.Type
