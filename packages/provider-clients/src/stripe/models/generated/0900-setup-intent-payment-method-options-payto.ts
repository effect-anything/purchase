import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsPayto = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsMandateOptionsPayto, any, any> =>
        Models.SetupIntentPaymentMethodOptionsMandateOptionsPayto as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsMandateOptionsPayto,
          any,
          any
        >
    )
  )
})
export type SetupIntentPaymentMethodOptionsPayto = typeof SetupIntentPaymentMethodOptionsPayto.Type
