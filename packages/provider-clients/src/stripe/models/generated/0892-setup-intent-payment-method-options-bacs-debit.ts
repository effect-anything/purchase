import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsBacsDebit = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit => Models.SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit)),
})
export type SetupIntentPaymentMethodOptionsBacsDebit = typeof SetupIntentPaymentMethodOptionsBacsDebit.Type
