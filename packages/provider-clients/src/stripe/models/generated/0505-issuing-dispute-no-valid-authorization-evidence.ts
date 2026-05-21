import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeNoValidAuthorizationEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  explanation: Schema.NullOr(Schema.String)
})
export type IssuingDisputeNoValidAuthorizationEvidence = typeof IssuingDisputeNoValidAuthorizationEvidence.Type
