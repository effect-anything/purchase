import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsUsBankAccount = Schema.Struct({
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
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
  transaction_purpose: Schema.optional(Schema.Literal("goods", "other", "services", "unspecified")),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
})
export type PaymentIntentPaymentMethodOptionsUsBankAccount = typeof PaymentIntentPaymentMethodOptionsUsBankAccount.Type
