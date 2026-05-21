import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type IssuingDispute = {
  readonly amount: number
  readonly balance_transactions?: ReadonlyArray<Models.BalanceTransaction> | null
  readonly created: number
  readonly currency: string
  readonly evidence: Models.IssuingDisputeEvidence
  readonly id: string
  readonly livemode: boolean
  readonly loss_reason?:
    | "cardholder_authentication_issuer_liability"
    | "eci5_token_transaction_with_tavv"
    | "excess_disputes_in_timeframe"
    | "has_not_met_the_minimum_dispute_amount_requirements"
    | "invalid_duplicate_dispute"
    | "invalid_incorrect_amount_dispute"
    | "invalid_no_authorization"
    | "invalid_use_of_disputes"
    | "merchandise_delivered_or_shipped"
    | "merchandise_or_service_as_described"
    | "not_cancelled"
    | "other"
    | "refund_issued"
    | "submitted_beyond_allowable_time_limit"
    | "transaction_3ds_required"
    | "transaction_approved_after_prior_fraud_dispute"
    | "transaction_authorized"
    | "transaction_electronically_read"
    | "transaction_qualifies_for_visa_easy_payment_service"
    | "transaction_unattended"
  readonly metadata: Readonly<Record<string, string>>
  readonly object: "issuing.dispute"
  readonly status: "expired" | "lost" | "submitted" | "unsubmitted" | "won"
  readonly transaction: string | Models.IssuingTransaction
  readonly treasury?: Models.IssuingDisputeTreasury | null
}

export const IssuingDispute = Schema.Struct({
  amount: Schema.Number,
  balance_transactions: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.BalanceTransaction, any, any> =>
            Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
        )
      )
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  evidence: Schema.suspend(
    (): Schema.Schema<Models.IssuingDisputeEvidence, any, any> =>
      Models.IssuingDisputeEvidence as Schema.Schema<Models.IssuingDisputeEvidence, any, any>
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  loss_reason: Schema.optional(
    Schema.Literal(
      "cardholder_authentication_issuer_liability",
      "eci5_token_transaction_with_tavv",
      "excess_disputes_in_timeframe",
      "has_not_met_the_minimum_dispute_amount_requirements",
      "invalid_duplicate_dispute",
      "invalid_incorrect_amount_dispute",
      "invalid_no_authorization",
      "invalid_use_of_disputes",
      "merchandise_delivered_or_shipped",
      "merchandise_or_service_as_described",
      "not_cancelled",
      "other",
      "refund_issued",
      "submitted_beyond_allowable_time_limit",
      "transaction_3ds_required",
      "transaction_approved_after_prior_fraud_dispute",
      "transaction_authorized",
      "transaction_electronically_read",
      "transaction_qualifies_for_visa_easy_payment_service",
      "transaction_unattended"
    )
  ),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("issuing.dispute"),
  status: Schema.Literal("expired", "lost", "submitted", "unsubmitted", "won"),
  transaction: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransaction, any, any> =>
        Models.IssuingTransaction as Schema.Schema<Models.IssuingTransaction, any, any>
    )
  ),
  treasury: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingDisputeTreasury, any, any> =>
          Models.IssuingDisputeTreasury as Schema.Schema<Models.IssuingDisputeTreasury, any, any>
      )
    )
  )
})
