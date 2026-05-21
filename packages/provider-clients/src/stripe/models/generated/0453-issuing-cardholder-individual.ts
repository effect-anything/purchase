import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholderIndividual = Schema.Struct({
  card_issuing: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingCardholderCardIssuing, any, any> =>
          Models.IssuingCardholderCardIssuing as Schema.Schema<Models.IssuingCardholderCardIssuing, any, any>
      )
    )
  ),
  dob: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderIndividualDob, any, any> =>
        Models.IssuingCardholderIndividualDob as Schema.Schema<Models.IssuingCardholderIndividualDob, any, any>
    )
  ),
  first_name: Schema.NullOr(Schema.String),
  last_name: Schema.NullOr(Schema.String),
  verification: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderVerification, any, any> =>
        Models.IssuingCardholderVerification as Schema.Schema<Models.IssuingCardholderVerification, any, any>
    )
  )
})
export type IssuingCardholderIndividual = typeof IssuingCardholderIndividual.Type
