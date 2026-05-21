import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsBacsDebit = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit, any, any> =>
        Models.SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsMandateOptionsBacsDebit,
          any,
          any
        >
    )
  )
})
export type SetupIntentPaymentMethodOptionsBacsDebit = typeof SetupIntentPaymentMethodOptionsBacsDebit.Type
