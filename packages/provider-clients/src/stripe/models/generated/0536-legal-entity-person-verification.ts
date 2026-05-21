import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LegalEntityPersonVerification = Schema.Struct({
  additional_document: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityPersonVerificationDocument, any, any> =>
          Models.LegalEntityPersonVerificationDocument as Schema.Schema<
            Models.LegalEntityPersonVerificationDocument,
            any,
            any
          >
      )
    )
  ),
  details: Schema.optional(Schema.NullOr(Schema.String)),
  details_code: Schema.optional(Schema.NullOr(Schema.String)),
  document: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LegalEntityPersonVerificationDocument, any, any> =>
        Models.LegalEntityPersonVerificationDocument as Schema.Schema<
          Models.LegalEntityPersonVerificationDocument,
          any,
          any
        >
    )
  ),
  status: Schema.String
})
export type LegalEntityPersonVerification = typeof LegalEntityPersonVerification.Type
