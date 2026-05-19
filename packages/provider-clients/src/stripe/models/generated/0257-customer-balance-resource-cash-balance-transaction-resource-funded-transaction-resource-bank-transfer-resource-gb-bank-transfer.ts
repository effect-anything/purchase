import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceGbBankTransfer = Schema.Struct({
  account_number_last4: Schema.NullOr(Schema.String),
  sender_name: Schema.NullOr(Schema.String),
  sort_code: Schema.NullOr(Schema.String),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceGbBankTransfer = typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceGbBankTransfer.Type
