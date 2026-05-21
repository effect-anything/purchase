import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Review = {
  readonly billing_zip: string | null
  readonly charge: string | Models.Charge | null
  readonly closed_reason:
    | "acknowledged"
    | "approved"
    | "canceled"
    | "disputed"
    | "payment_never_settled"
    | "redacted"
    | "refunded"
    | "refunded_as_fraud"
    | null
  readonly created: number
  readonly id: string
  readonly ip_address: string | null
  readonly ip_address_location: Models.RadarReviewResourceLocation | null
  readonly livemode: boolean
  readonly object: "review"
  readonly open: boolean
  readonly opened_reason: "manual" | "rule"
  readonly payment_intent?: string | Models.PaymentIntent
  readonly reason: string
  readonly session: Models.RadarReviewResourceSession | null
}

export const Review = Schema.Struct({
  billing_zip: Schema.NullOr(Schema.String),
  charge: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  closed_reason: Schema.NullOr(
    Schema.Literal(
      "acknowledged",
      "approved",
      "canceled",
      "disputed",
      "payment_never_settled",
      "redacted",
      "refunded",
      "refunded_as_fraud"
    )
  ),
  created: Schema.Number,
  id: Schema.String,
  ip_address: Schema.NullOr(Schema.String),
  ip_address_location: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.RadarReviewResourceLocation, any, any> =>
        Models.RadarReviewResourceLocation as Schema.Schema<Models.RadarReviewResourceLocation, any, any>
    )
  ),
  livemode: Schema.Boolean,
  object: Schema.Literal("review"),
  open: Schema.Boolean,
  opened_reason: Schema.Literal("manual", "rule"),
  payment_intent: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentIntent, any, any> =>
          Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
      )
    )
  ),
  reason: Schema.String,
  session: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.RadarReviewResourceSession, any, any> =>
        Models.RadarReviewResourceSession as Schema.Schema<Models.RadarReviewResourceSession, any, any>
    )
  )
})
