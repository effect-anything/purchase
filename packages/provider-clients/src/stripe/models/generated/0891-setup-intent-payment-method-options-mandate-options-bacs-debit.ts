import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit = Schema.Struct({
  reference_prefix: Schema.optional(Schema.String)
})
export type SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit =
  typeof SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit.Type
