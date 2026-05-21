import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeServiceNotAsDescribedEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  canceled_at: Schema.NullOr(Schema.Number),
  cancellation_reason: Schema.NullOr(Schema.String),
  explanation: Schema.NullOr(Schema.String),
  received_at: Schema.NullOr(Schema.Number)
})
export type IssuingDisputeServiceNotAsDescribedEvidence = typeof IssuingDisputeServiceNotAsDescribedEvidence.Type
