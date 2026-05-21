import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction = Schema.Struct({
  bank_transfer: Schema.suspend(
    (): Schema.Schema<
      Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer,
      any,
      any
    > =>
      Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer as Schema.Schema<
        Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer,
        any,
        any
      >
  )
})
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction =
  typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction.Type
