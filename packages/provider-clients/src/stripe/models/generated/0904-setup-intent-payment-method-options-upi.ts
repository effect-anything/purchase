import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsUpi = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsMandateOptionsUpi, any, any> =>
        Models.PaymentMethodOptionsMandateOptionsUpi as Schema.Schema<
          Models.PaymentMethodOptionsMandateOptionsUpi,
          any,
          any
        >
    )
  )
})
export type SetupIntentPaymentMethodOptionsUpi = typeof SetupIntentPaymentMethodOptionsUpi.Type
