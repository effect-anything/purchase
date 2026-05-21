import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsUsBankAccount = Schema.Struct({
  financial_connections: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LinkedAccountOptionsCommon, any, any> =>
        Models.LinkedAccountOptionsCommon as Schema.Schema<Models.LinkedAccountOptionsCommon, any, any>
    )
  ),
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsUsBankAccountMandateOptions, any, any> =>
        Models.PaymentMethodOptionsUsBankAccountMandateOptions as Schema.Schema<
          Models.PaymentMethodOptionsUsBankAccountMandateOptions,
          any,
          any
        >
    )
  ),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
})
export type SetupIntentPaymentMethodOptionsUsBankAccount = typeof SetupIntentPaymentMethodOptionsUsBankAccount.Type
