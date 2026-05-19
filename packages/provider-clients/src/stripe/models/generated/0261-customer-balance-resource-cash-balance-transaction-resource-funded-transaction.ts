import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction = Schema.Struct({
  bank_transfer: Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer => Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction = typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction.Type
