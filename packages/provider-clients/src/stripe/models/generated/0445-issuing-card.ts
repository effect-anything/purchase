import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCard = Schema.Struct({
  brand: Schema.String,
  cancellation_reason: Schema.NullOr(Schema.Literal("design_rejected", "fulfillment_error", "lost", "stolen")),
  cardholder: Schema.suspend((): typeof Models.IssuingCardholder => Models.IssuingCardholder),
  created: Schema.Number,
  currency: Schema.String,
  cvc: Schema.optional(Schema.String),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  financial_account: Schema.optional(Schema.NullOr(Schema.String)),
  id: Schema.String,
  last4: Schema.String,
  latest_fraud_warning: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardFraudWarning => Models.IssuingCardFraudWarning)),
  lifecycle_controls: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardLifecycleControls => Models.IssuingCardLifecycleControls)),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  number: Schema.optional(Schema.String),
  object: Schema.Literal("issuing.card"),
  personalization_design: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingPersonalizationDesign => Models.IssuingPersonalizationDesign))),
  replaced_by: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingCard => Models.IssuingCard))),
  replacement_for: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingCard => Models.IssuingCard))),
  replacement_reason: Schema.NullOr(Schema.Literal("damaged", "expired", "fulfillment_error", "lost", "stolen")),
  second_line: Schema.NullOr(Schema.String),
  shipping: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardShipping => Models.IssuingCardShipping)),
  spending_controls: Schema.suspend((): typeof Models.IssuingCardAuthorizationControls => Models.IssuingCardAuthorizationControls),
  status: Schema.Literal("active", "canceled", "inactive"),
  type: Schema.Literal("physical", "virtual"),
  wallets: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardWallets => Models.IssuingCardWallets)),
})
export type IssuingCard = typeof IssuingCard.Type
