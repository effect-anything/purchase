import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPaymentAttempt = Schema.Struct({
  payment_attempt_id: Schema.String,
  stored_payment_method_id: Schema.String,
  payment_method_id: Schema.NullOr(Schema.suspend(() => Models.PaymentMethodId)),
  amount: Schema.String,
  status: Schema.suspend(() => Models.PaymentAttemptStatus),
  error_code: Schema.NullOr(Schema.suspend(() => Models.ErrorCode)),
  method_details: Schema.suspend(() => Models.MethodDetails),
  created_at: Schema.suspend(() => Models.CreatedAt),
  captured_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
})
export type TransactionPaymentAttempt = typeof TransactionPaymentAttempt.Type
