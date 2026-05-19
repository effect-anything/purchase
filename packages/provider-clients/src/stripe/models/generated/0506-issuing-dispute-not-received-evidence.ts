import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingDisputeNotReceivedEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  expected_at: Schema.NullOr(Schema.Number),
  explanation: Schema.NullOr(Schema.String),
  product_description: Schema.NullOr(Schema.String),
  product_type: Schema.NullOr(Schema.Literal("merchandise", "service")),
})
export type IssuingDisputeNotReceivedEvidence = typeof IssuingDisputeNotReceivedEvidence.Type
