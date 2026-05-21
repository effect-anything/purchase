import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsPix = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsMandateOptionsPix, any, any> =>
        Models.PaymentMethodOptionsMandateOptionsPix as Schema.Schema<
          Models.PaymentMethodOptionsMandateOptionsPix,
          any,
          any
        >
    )
  )
})
export type SetupIntentPaymentMethodOptionsPix = typeof SetupIntentPaymentMethodOptionsPix.Type
