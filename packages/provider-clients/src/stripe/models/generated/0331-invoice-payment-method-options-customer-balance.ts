import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsCustomerBalance = Schema.Struct({
  bank_transfer: Schema.optional(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransfer => Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransfer)),
  funding_type: Schema.NullOr(Schema.Literal("bank_transfer")),
})
export type InvoicePaymentMethodOptionsCustomerBalance = typeof InvoicePaymentMethodOptionsCustomerBalance.Type
