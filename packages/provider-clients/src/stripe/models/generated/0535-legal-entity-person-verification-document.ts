import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegalEntityPersonVerificationDocument = Schema.Struct({
  back: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  details: Schema.NullOr(Schema.String),
  details_code: Schema.NullOr(Schema.String),
  front: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
})
export type LegalEntityPersonVerificationDocument = typeof LegalEntityPersonVerificationDocument.Type
