import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft = Schema.Struct({
  balance_transaction: Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction)),
  linked_transaction: Schema.Union(Schema.String, Schema.suspend((): typeof Models.CustomerCashBalanceTransaction => Models.CustomerCashBalanceTransaction)),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft = typeof CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft.Type
