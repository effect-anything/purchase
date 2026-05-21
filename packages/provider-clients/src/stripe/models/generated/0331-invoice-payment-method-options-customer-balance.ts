import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsCustomerBalance = Schema.Struct({
  bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransfer, any, any> =>
        Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransfer as Schema.Schema<
          Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransfer,
          any,
          any
        >
    )
  ),
  funding_type: Schema.NullOr(Schema.Literal("bank_transfer"))
})
export type InvoicePaymentMethodOptionsCustomerBalance = typeof InvoicePaymentMethodOptionsCustomerBalance.Type
