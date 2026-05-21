import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsAcssDebit = Schema.Struct({
  currency: Schema.NullOr(Schema.Literal("cad", "usd")),
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsMandateOptionsAcssDebit, any, any> =>
        Models.SetupIntentPaymentMethodOptionsMandateOptionsAcssDebit as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsMandateOptionsAcssDebit,
          any,
          any
        >
    )
  ),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
})
export type SetupIntentPaymentMethodOptionsAcssDebit = typeof SetupIntentPaymentMethodOptionsAcssDebit.Type
