import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsCustomerBalanceBankTransfer = Schema.Struct({
  eu_bank_transfer: Schema.optional(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransferEuBankTransfer => Models.InvoicePaymentMethodOptionsCustomerBalanceBankTransferEuBankTransfer)),
  type: Schema.NullOr(Schema.String),
})
export type InvoicePaymentMethodOptionsCustomerBalanceBankTransfer = typeof InvoicePaymentMethodOptionsCustomerBalanceBankTransfer.Type
