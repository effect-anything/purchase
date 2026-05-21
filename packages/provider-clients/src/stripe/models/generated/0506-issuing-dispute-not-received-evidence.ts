import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeNotReceivedEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  expected_at: Schema.NullOr(Schema.Number),
  explanation: Schema.NullOr(Schema.String),
  product_description: Schema.NullOr(Schema.String),
  product_type: Schema.NullOr(Schema.Literal("merchandise", "service"))
})
export type IssuingDisputeNotReceivedEvidence = typeof IssuingDisputeNotReceivedEvidence.Type
