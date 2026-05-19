import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholder = Schema.Struct({
  billing: Schema.suspend((): typeof Models.IssuingCardholderAddress => Models.IssuingCardholderAddress),
  company: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderCompany => Models.IssuingCardholderCompany)),
  created: Schema.Number,
  email: Schema.NullOr(Schema.String),
  id: Schema.String,
  individual: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderIndividual => Models.IssuingCardholderIndividual)),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.String,
  object: Schema.Literal("issuing.cardholder"),
  phone_number: Schema.NullOr(Schema.String),
  preferred_locales: Schema.NullOr(Schema.Array(Schema.Literal("de", "en", "es", "fr", "it"))),
  requirements: Schema.suspend((): typeof Models.IssuingCardholderRequirements => Models.IssuingCardholderRequirements),
  spending_controls: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderAuthorizationControls => Models.IssuingCardholderAuthorizationControls)),
  status: Schema.Literal("active", "blocked", "inactive"),
  type: Schema.Literal("company", "individual"),
})
export type IssuingCardholder = typeof IssuingCardholder.Type
