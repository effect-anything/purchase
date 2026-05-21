import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction = {
  readonly payment_intent: string | Models.PaymentIntent
}

export const CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction = Schema.Struct({
  payment_intent: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntent, any, any> =>
        Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
    )
  )
})
