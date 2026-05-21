import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPaymentAttempt = Schema.Struct({
  payment_attempt_id: Schema.String,
  stored_payment_method_id: Schema.String,
  payment_method_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.PaymentMethodId> => Models.PaymentMethodId)),
  amount: Schema.String,
  status: Schema.suspend((): Schema.Schema<Models.PaymentAttemptStatus> => Models.PaymentAttemptStatus),
  error_code: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ErrorCode> => Models.ErrorCode)),
  method_details: Schema.suspend((): Schema.Schema<Models.MethodDetails> => Models.MethodDetails),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  captured_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp))
})
export type TransactionPaymentAttempt = typeof TransactionPaymentAttempt.Type
