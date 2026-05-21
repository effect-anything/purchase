import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CancellationDetails = Schema.Struct({
  comment: Schema.NullOr(Schema.String),
  feedback: Schema.NullOr(
    Schema.Literal(
      "customer_service",
      "low_quality",
      "missing_features",
      "other",
      "switched_service",
      "too_complex",
      "too_expensive",
      "unused"
    )
  ),
  reason: Schema.NullOr(
    Schema.Literal("canceled_by_retention_policy", "cancellation_requested", "payment_disputed", "payment_failed")
  )
})
export type CancellationDetails = typeof CancellationDetails.Type
