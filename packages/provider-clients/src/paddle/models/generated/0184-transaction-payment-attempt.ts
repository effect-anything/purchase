import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPaymentAttempt = Schema.Struct({
  payment_attempt_id: Schema.String,
  stored_payment_method_id: Schema.String,
  payment_method_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodId, any, any> =>
        Models.PaymentMethodId as Schema.Schema<Models.PaymentMethodId, any, any>
    )
  ),
  amount: Schema.String,
  status: Schema.suspend(
    (): Schema.Schema<Models.PaymentAttemptStatus, any, any> =>
      Models.PaymentAttemptStatus as Schema.Schema<Models.PaymentAttemptStatus, any, any>
  ),
  error_code: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ErrorCode, any, any> => Models.ErrorCode as Schema.Schema<Models.ErrorCode, any, any>
    )
  ),
  method_details: Schema.suspend(
    (): Schema.Schema<Models.MethodDetails, any, any> =>
      Models.MethodDetails as Schema.Schema<Models.MethodDetails, any, any>
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  captured_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  )
})
export type TransactionPaymentAttempt = typeof TransactionPaymentAttempt.Type
