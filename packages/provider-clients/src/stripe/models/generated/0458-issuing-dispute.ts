import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingDispute = Schema.Struct({
  amount: Schema.Number,
  balance_transactions: Schema.optional(Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction)))),
  created: Schema.Number,
  currency: Schema.String,
  evidence: Schema.suspend((): typeof Models.IssuingDisputeEvidence => Models.IssuingDisputeEvidence),
  id: Schema.String,
  livemode: Schema.Boolean,
  loss_reason: Schema.optional(Schema.Literal("cardholder_authentication_issuer_liability", "eci5_token_transaction_with_tavv", "excess_disputes_in_timeframe", "has_not_met_the_minimum_dispute_amount_requirements", "invalid_duplicate_dispute", "invalid_incorrect_amount_dispute", "invalid_no_authorization", "invalid_use_of_disputes", "merchandise_delivered_or_shipped", "merchandise_or_service_as_described", "not_cancelled", "other", "refund_issued", "submitted_beyond_allowable_time_limit", "transaction_3ds_required", "transaction_approved_after_prior_fraud_dispute", "transaction_authorized", "transaction_electronically_read", "transaction_qualifies_for_visa_easy_payment_service", "transaction_unattended")),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("issuing.dispute"),
  status: Schema.Literal("expired", "lost", "submitted", "unsubmitted", "won"),
  transaction: Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingTransaction => Models.IssuingTransaction)),
  treasury: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.IssuingDisputeTreasury => Models.IssuingDisputeTreasury))),
})
export type IssuingDispute = typeof IssuingDispute.Type
