import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholder = Schema.Struct({
  billing: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardholderAddress, any, any> =>
      Models.IssuingCardholderAddress as Schema.Schema<Models.IssuingCardholderAddress, any, any>
  ),
  company: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderCompany, any, any> =>
        Models.IssuingCardholderCompany as Schema.Schema<Models.IssuingCardholderCompany, any, any>
    )
  ),
  created: Schema.Number,
  email: Schema.NullOr(Schema.String),
  id: Schema.String,
  individual: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderIndividual, any, any> =>
        Models.IssuingCardholderIndividual as Schema.Schema<Models.IssuingCardholderIndividual, any, any>
    )
  ),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.String,
  object: Schema.Literal("issuing.cardholder"),
  phone_number: Schema.NullOr(Schema.String),
  preferred_locales: Schema.NullOr(Schema.Array(Schema.Literal("de", "en", "es", "fr", "it"))),
  requirements: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardholderRequirements, any, any> =>
      Models.IssuingCardholderRequirements as Schema.Schema<Models.IssuingCardholderRequirements, any, any>
  ),
  spending_controls: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderAuthorizationControls, any, any> =>
        Models.IssuingCardholderAuthorizationControls as Schema.Schema<
          Models.IssuingCardholderAuthorizationControls,
          any,
          any
        >
    )
  ),
  status: Schema.Literal("active", "blocked", "inactive"),
  type: Schema.Literal("company", "individual")
})
export type IssuingCardholder = typeof IssuingCardholder.Type
