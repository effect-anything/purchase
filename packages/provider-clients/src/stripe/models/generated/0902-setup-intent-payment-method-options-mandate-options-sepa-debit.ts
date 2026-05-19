import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit = Schema.Struct({
  reference_prefix: Schema.optional(Schema.String),
})
export type SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit = typeof SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit.Type
