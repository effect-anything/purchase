import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PersonEthnicityDetails = Schema.Struct({
  ethnicity: Schema.NullOr(Schema.Array(Schema.Literal("cuban", "hispanic_or_latino", "mexican", "not_hispanic_or_latino", "other_hispanic_or_latino", "prefer_not_to_answer", "puerto_rican"))),
  ethnicity_other: Schema.NullOr(Schema.String),
})
export type PersonEthnicityDetails = typeof PersonEthnicityDetails.Type
