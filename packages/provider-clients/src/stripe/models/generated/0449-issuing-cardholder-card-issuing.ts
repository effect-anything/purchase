import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholderCardIssuing = Schema.Struct({
  user_terms_acceptance: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderUserTermsAcceptance, any, any> =>
        Models.IssuingCardholderUserTermsAcceptance as Schema.Schema<
          Models.IssuingCardholderUserTermsAcceptance,
          any,
          any
        >
    )
  )
})
export type IssuingCardholderCardIssuing = typeof IssuingCardholderCardIssuing.Type
