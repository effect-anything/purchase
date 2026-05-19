import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingDisputeDuplicateEvidence = Schema.Struct({
  additional_documentation: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  card_statement: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  cash_receipt: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  check_image: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  explanation: Schema.NullOr(Schema.String),
  original_transaction: Schema.NullOr(Schema.String),
})
export type IssuingDisputeDuplicateEvidence = typeof IssuingDisputeDuplicateEvidence.Type
