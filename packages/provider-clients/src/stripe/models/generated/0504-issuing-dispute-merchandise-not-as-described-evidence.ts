import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingDisputeMerchandiseNotAsDescribedEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  explanation: Schema.NullOr(Schema.String),
  received_at: Schema.NullOr(Schema.Number),
  return_description: Schema.NullOr(Schema.String),
  return_status: Schema.NullOr(Schema.Literal("merchant_rejected", "successful")),
  returned_at: Schema.NullOr(Schema.Number),
})
export type IssuingDisputeMerchandiseNotAsDescribedEvidence = typeof IssuingDisputeMerchandiseNotAsDescribedEvidence.Type
