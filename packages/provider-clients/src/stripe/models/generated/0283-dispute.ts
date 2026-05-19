import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Dispute = Schema.Struct({
  amount: Schema.Number,
  balance_transactions: Schema.Array(Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction)),
  charge: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge)),
  created: Schema.Number,
  currency: Schema.String,
  enhanced_eligibility_types: Schema.Array(Schema.Literal("visa_compelling_evidence_3", "visa_compliance")),
  evidence: Schema.suspend((): typeof Models.DisputeEvidence => Models.DisputeEvidence),
  evidence_details: Schema.suspend((): typeof Models.DisputeEvidenceDetails => Models.DisputeEvidenceDetails),
  id: Schema.String,
  is_charge_refundable: Schema.Boolean,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  network_reason_code: Schema.optional(Schema.NullOr(Schema.String)),
  object: Schema.Literal("dispute"),
  payment_intent: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentIntent => Models.PaymentIntent))),
  payment_method_details: Schema.optional(Schema.suspend((): typeof Models.DisputePaymentMethodDetails => Models.DisputePaymentMethodDetails)),
  reason: Schema.String,
  status: Schema.Literal("lost", "needs_response", "prevented", "under_review", "warning_closed", "warning_needs_response", "warning_under_review", "won"),
})
export type Dispute = typeof Dispute.Type
