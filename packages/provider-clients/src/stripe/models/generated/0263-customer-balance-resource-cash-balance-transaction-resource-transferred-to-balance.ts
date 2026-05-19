import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance = Schema.Struct({
  balance_transaction: Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction)),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance = typeof CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance.Type
