import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholderIndividual = Schema.Struct({
  card_issuing: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderCardIssuing => Models.IssuingCardholderCardIssuing))),
  dob: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderIndividualDob => Models.IssuingCardholderIndividualDob)),
  first_name: Schema.NullOr(Schema.String),
  last_name: Schema.NullOr(Schema.String),
  verification: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderVerification => Models.IssuingCardholderVerification)),
})
export type IssuingCardholderIndividual = typeof IssuingCardholderIndividual.Type
