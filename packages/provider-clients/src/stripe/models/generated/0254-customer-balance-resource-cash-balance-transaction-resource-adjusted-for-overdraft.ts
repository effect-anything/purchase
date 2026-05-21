import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft = {
  readonly balance_transaction: string | Models.BalanceTransaction
  readonly linked_transaction: string | Models.CustomerCashBalanceTransaction
}

export const CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft = Schema.Struct({
  balance_transaction: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.BalanceTransaction, any, any> =>
        Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
    )
  ),
  linked_transaction: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.CustomerCashBalanceTransaction, any, any> =>
        Models.CustomerCashBalanceTransaction as Schema.Schema<Models.CustomerCashBalanceTransaction, any, any>
    )
  )
})
