import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsSepaDebit = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit, any, any> =>
        Models.SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsMandateOptionsSepaDebit,
          any,
          any
        >
    )
  )
})
export type SetupIntentPaymentMethodOptionsSepaDebit = typeof SetupIntentPaymentMethodOptionsSepaDebit.Type
