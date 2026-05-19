import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceJpBankTransfer = Schema.Struct({
  sender_bank: Schema.NullOr(Schema.String),
  sender_branch: Schema.NullOr(Schema.String),
  sender_name: Schema.NullOr(Schema.String),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceJpBankTransfer = typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceJpBankTransfer.Type
