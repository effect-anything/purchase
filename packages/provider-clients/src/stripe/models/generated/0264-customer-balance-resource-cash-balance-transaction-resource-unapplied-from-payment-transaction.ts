import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction = Schema.Struct({
  payment_intent: Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentIntent => Models.PaymentIntent)),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction = typeof CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction.Type
