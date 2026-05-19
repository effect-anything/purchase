import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Refund = Schema.Struct({
  amount: Schema.Number,
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  charge: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.optional(Schema.String),
  destination_details: Schema.optional(Schema.suspend((): typeof Models.RefundDestinationDetails => Models.RefundDestinationDetails)),
  failure_balance_transaction: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  failure_reason: Schema.optional(Schema.String),
  id: Schema.String,
  instructions_email: Schema.optional(Schema.String),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  next_action: Schema.optional(Schema.suspend((): typeof Models.RefundNextAction => Models.RefundNextAction)),
  object: Schema.Literal("refund"),
  payment_intent: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentIntent => Models.PaymentIntent))),
  pending_reason: Schema.optional(Schema.Literal("charge_pending", "insufficient_funds", "processing")),
  presentment_details: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPaymentIntentPresentmentDetails => Models.PaymentFlowsPaymentIntentPresentmentDetails)),
  reason: Schema.NullOr(Schema.Literal("duplicate", "expired_uncaptured_charge", "fraudulent", "requested_by_customer")),
  receipt_number: Schema.NullOr(Schema.String),
  source_transfer_reversal: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TransferReversal => Models.TransferReversal))),
  status: Schema.NullOr(Schema.String),
  transfer_reversal: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TransferReversal => Models.TransferReversal))),
})
export type Refund = typeof Refund.Type
