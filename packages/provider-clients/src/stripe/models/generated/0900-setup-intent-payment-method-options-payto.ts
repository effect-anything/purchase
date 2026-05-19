import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsPayto = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsMandateOptionsPayto => Models.SetupIntentPaymentMethodOptionsMandateOptionsPayto)),
})
export type SetupIntentPaymentMethodOptionsPayto = typeof SetupIntentPaymentMethodOptionsPayto.Type
