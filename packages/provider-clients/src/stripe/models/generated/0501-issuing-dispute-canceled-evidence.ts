import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeCanceledEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  canceled_at: Schema.NullOr(Schema.Number),
  cancellation_policy_provided: Schema.NullOr(Schema.Boolean),
  cancellation_reason: Schema.NullOr(Schema.String),
  expected_at: Schema.NullOr(Schema.Number),
  explanation: Schema.NullOr(Schema.String),
  product_description: Schema.NullOr(Schema.String),
  product_type: Schema.NullOr(Schema.Literal("merchandise", "service")),
  return_status: Schema.NullOr(Schema.Literal("merchant_rejected", "successful")),
  returned_at: Schema.NullOr(Schema.Number)
})
export type IssuingDisputeCanceledEvidence = typeof IssuingDisputeCanceledEvidence.Type
