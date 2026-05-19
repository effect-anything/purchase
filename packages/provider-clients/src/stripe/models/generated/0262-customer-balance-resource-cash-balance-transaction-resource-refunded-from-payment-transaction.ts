import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction = Schema.Struct({
  refund: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Refund => Models.Refund)),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction = typeof CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction.Type
