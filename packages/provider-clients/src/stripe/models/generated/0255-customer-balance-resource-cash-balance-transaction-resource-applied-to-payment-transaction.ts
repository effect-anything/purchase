import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction = Schema.Struct({
  payment_intent: Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentIntent => Models.PaymentIntent)),
})
export type CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction = typeof CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction.Type
