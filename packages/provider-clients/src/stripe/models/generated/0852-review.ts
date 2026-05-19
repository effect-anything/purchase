import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Review = Schema.Struct({
  billing_zip: Schema.NullOr(Schema.String),
  charge: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  closed_reason: Schema.NullOr(Schema.Literal("acknowledged", "approved", "canceled", "disputed", "payment_never_settled", "redacted", "refunded", "refunded_as_fraud")),
  created: Schema.Number,
  id: Schema.String,
  ip_address: Schema.NullOr(Schema.String),
  ip_address_location: Schema.NullOr(Schema.suspend((): typeof Models.RadarReviewResourceLocation => Models.RadarReviewResourceLocation)),
  livemode: Schema.Boolean,
  object: Schema.Literal("review"),
  open: Schema.Boolean,
  opened_reason: Schema.Literal("manual", "rule"),
  payment_intent: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentIntent => Models.PaymentIntent))),
  reason: Schema.String,
  session: Schema.NullOr(Schema.suspend((): typeof Models.RadarReviewResourceSession => Models.RadarReviewResourceSession)),
})
export type Review = typeof Review.Type
