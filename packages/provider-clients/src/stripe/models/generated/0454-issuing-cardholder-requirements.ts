import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholderRequirements = Schema.Struct({
  disabled_reason: Schema.NullOr(Schema.Literal("listed", "rejected.listed", "requirements.past_due", "under_review")),
  past_due: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "company.tax_id",
        "individual.card_issuing.user_terms_acceptance.date",
        "individual.card_issuing.user_terms_acceptance.ip",
        "individual.dob.day",
        "individual.dob.month",
        "individual.dob.year",
        "individual.first_name",
        "individual.last_name",
        "individual.verification.document"
      )
    )
  )
})
export type IssuingCardholderRequirements = typeof IssuingCardholderRequirements.Type
