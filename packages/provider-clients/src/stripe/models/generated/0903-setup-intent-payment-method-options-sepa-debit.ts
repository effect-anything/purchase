import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsSepaDebit = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit => Models.SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit)),
})
export type SetupIntentPaymentMethodOptionsSepaDebit = typeof SetupIntentPaymentMethodOptionsSepaDebit.Type
