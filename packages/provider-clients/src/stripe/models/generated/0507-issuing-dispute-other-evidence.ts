import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeOtherEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  explanation: Schema.NullOr(Schema.String),
  product_description: Schema.NullOr(Schema.String),
  product_type: Schema.NullOr(Schema.Literal("merchandise", "service"))
})
export type IssuingDisputeOtherEvidence = typeof IssuingDisputeOtherEvidence.Type
