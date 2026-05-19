import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegalEntityPersonVerification = Schema.Struct({
  additional_document: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityPersonVerificationDocument => Models.LegalEntityPersonVerificationDocument))),
  details: Schema.optional(Schema.NullOr(Schema.String)),
  details_code: Schema.optional(Schema.NullOr(Schema.String)),
  document: Schema.optional(Schema.suspend((): typeof Models.LegalEntityPersonVerificationDocument => Models.LegalEntityPersonVerificationDocument)),
  status: Schema.String,
})
export type LegalEntityPersonVerification = typeof LegalEntityPersonVerification.Type
