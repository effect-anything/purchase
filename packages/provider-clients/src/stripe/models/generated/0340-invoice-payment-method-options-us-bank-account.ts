import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsUsBankAccount = Schema.Struct({
  financial_connections: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions, any, any> =>
        Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions as Schema.Schema<
          Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions,
          any,
          any
        >
    )
  ),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
})
export type InvoicePaymentMethodOptionsUsBankAccount = typeof InvoicePaymentMethodOptionsUsBankAccount.Type
