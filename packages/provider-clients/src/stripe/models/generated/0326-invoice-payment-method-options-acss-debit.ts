import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsAcssDebit = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsAcssDebitMandateOptions, any, any> =>
        Models.InvoicePaymentMethodOptionsAcssDebitMandateOptions as Schema.Schema<
          Models.InvoicePaymentMethodOptionsAcssDebitMandateOptions,
          any,
          any
        >
    )
  ),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
})
export type InvoicePaymentMethodOptionsAcssDebit = typeof InvoicePaymentMethodOptionsAcssDebit.Type
