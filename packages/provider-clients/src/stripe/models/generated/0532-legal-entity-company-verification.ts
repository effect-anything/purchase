import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LegalEntityCompanyVerification = Schema.Struct({
  document: Schema.suspend(
    (): Schema.Schema<Models.LegalEntityCompanyVerificationDocument, any, any> =>
      Models.LegalEntityCompanyVerificationDocument as Schema.Schema<
        Models.LegalEntityCompanyVerificationDocument,
        any,
        any
      >
  )
})
export type LegalEntityCompanyVerification = typeof LegalEntityCompanyVerification.Type
