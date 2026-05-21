import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationRequest2 = Schema.Struct({
  amount: Schema.Number,
  amount_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationAmountDetails, any, any> =>
        Models.IssuingAuthorizationAmountDetails as Schema.Schema<Models.IssuingAuthorizationAmountDetails, any, any>
    )
  ),
  approved: Schema.Boolean,
  authorization_code: Schema.NullOr(Schema.String),
  created: Schema.Number,
  currency: Schema.String,
  merchant_amount: Schema.Number,
  merchant_currency: Schema.String,
  network_risk_score: Schema.NullOr(Schema.Number),
  reason: Schema.Literal(
    "account_disabled",
    "card_active",
    "card_canceled",
    "card_expired",
    "card_inactive",
    "cardholder_blocked",
    "cardholder_inactive",
    "cardholder_verification_required",
    "insecure_authorization_method",
    "insufficient_funds",
    "network_fallback",
    "not_allowed",
    "pin_blocked",
    "spending_controls",
    "suspected_fraud",
    "verification_failed",
    "webhook_approved",
    "webhook_declined",
    "webhook_error",
    "webhook_timeout"
  ),
  reason_message: Schema.NullOr(Schema.String),
  requested_at: Schema.NullOr(Schema.Number)
})
export type IssuingAuthorizationRequest2 = typeof IssuingAuthorizationRequest2.Type
