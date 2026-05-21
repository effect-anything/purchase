import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction = {
  readonly refund: string | Models.Refund
}

export const CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction = Schema.Struct({
  refund: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>
    )
  )
})
