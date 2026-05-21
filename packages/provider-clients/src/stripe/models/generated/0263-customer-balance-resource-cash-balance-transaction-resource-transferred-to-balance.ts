import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance = {
  readonly balance_transaction: string | Models.BalanceTransaction
}

export const CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance = Schema.Struct({
  balance_transaction: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.BalanceTransaction, any, any> =>
        Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
    )
  )
})
