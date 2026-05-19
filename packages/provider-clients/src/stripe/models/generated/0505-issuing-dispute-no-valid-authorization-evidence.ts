import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingDisputeNoValidAuthorizationEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  explanation: Schema.NullOr(Schema.String),
})
export type IssuingDisputeNoValidAuthorizationEvidence = typeof IssuingDisputeNoValidAuthorizationEvidence.Type
