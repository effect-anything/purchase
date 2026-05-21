import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Dispute = {
  readonly amount: number
  readonly balance_transactions: ReadonlyArray<Models.BalanceTransaction>
  readonly charge: string | Models.Charge
  readonly created: number
  readonly currency: string
  readonly enhanced_eligibility_types: ReadonlyArray<"visa_compelling_evidence_3" | "visa_compliance">
  readonly evidence: Models.DisputeEvidence
  readonly evidence_details: Models.DisputeEvidenceDetails
  readonly id: string
  readonly is_charge_refundable: boolean
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly network_reason_code?: string | null
  readonly object: "dispute"
  readonly payment_intent: string | Models.PaymentIntent | null
  readonly payment_method_details?: Models.DisputePaymentMethodDetails
  readonly reason: string
  readonly status:
    | "lost"
    | "needs_response"
    | "prevented"
    | "under_review"
    | "warning_closed"
    | "warning_needs_response"
    | "warning_under_review"
    | "won"
}

export const Dispute = Schema.Struct({
  amount: Schema.Number,
  balance_transactions: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.BalanceTransaction, any, any> =>
        Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
    )
  ),
  charge: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  enhanced_eligibility_types: Schema.Array(Schema.Literal("visa_compelling_evidence_3", "visa_compliance")),
  evidence: Schema.suspend(
    (): Schema.Schema<Models.DisputeEvidence, any, any> =>
      Models.DisputeEvidence as Schema.Schema<Models.DisputeEvidence, any, any>
  ),
  evidence_details: Schema.suspend(
    (): Schema.Schema<Models.DisputeEvidenceDetails, any, any> =>
      Models.DisputeEvidenceDetails as Schema.Schema<Models.DisputeEvidenceDetails, any, any>
  ),
  id: Schema.String,
  is_charge_refundable: Schema.Boolean,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  network_reason_code: Schema.optional(Schema.NullOr(Schema.String)),
  object: Schema.Literal("dispute"),
  payment_intent: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentIntent, any, any> =>
          Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
      )
    )
  ),
  payment_method_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputePaymentMethodDetails, any, any> =>
        Models.DisputePaymentMethodDetails as Schema.Schema<Models.DisputePaymentMethodDetails, any, any>
    )
  ),
  reason: Schema.String,
  status: Schema.Literal(
    "lost",
    "needs_response",
    "prevented",
    "under_review",
    "warning_closed",
    "warning_needs_response",
    "warning_under_review",
    "won"
  )
})
