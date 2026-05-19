import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceEuBankTransfer = Schema.Struct({
  bic: Schema.NullOr(Schema.String),
  iban_last4: Schema.NullOr(Schema.String),
  sender_name: Schema.NullOr(Schema.String),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceEuBankTransfer = typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceEuBankTransfer.Type
