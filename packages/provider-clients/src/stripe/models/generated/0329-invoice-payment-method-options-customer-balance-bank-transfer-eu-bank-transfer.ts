import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsCustomerBalanceBankTransferEuBankTransfer = Schema.Struct({
  country: Schema.Literal("BE", "DE", "ES", "FR", "IE", "NL")
})
export type InvoicePaymentMethodOptionsCustomerBalanceBankTransferEuBankTransfer =
  typeof InvoicePaymentMethodOptionsCustomerBalanceBankTransferEuBankTransfer.Type
