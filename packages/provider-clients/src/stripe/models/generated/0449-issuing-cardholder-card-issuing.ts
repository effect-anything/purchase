import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholderCardIssuing = Schema.Struct({
  user_terms_acceptance: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderUserTermsAcceptance => Models.IssuingCardholderUserTermsAcceptance)),
})
export type IssuingCardholderCardIssuing = typeof IssuingCardholderCardIssuing.Type
