import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegalEntityCompanyVerification = Schema.Struct({
  document: Schema.suspend((): typeof Models.LegalEntityCompanyVerificationDocument => Models.LegalEntityCompanyVerificationDocument),
})
export type LegalEntityCompanyVerification = typeof LegalEntityCompanyVerification.Type
