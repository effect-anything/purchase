import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PersonUsCfpbData = Schema.Struct({
  ethnicity_details: Schema.NullOr(Schema.suspend((): typeof Models.PersonEthnicityDetails => Models.PersonEthnicityDetails)),
  race_details: Schema.NullOr(Schema.suspend((): typeof Models.PersonRaceDetails => Models.PersonRaceDetails)),
  self_identified_gender: Schema.NullOr(Schema.String),
})
export type PersonUsCfpbData = typeof PersonUsCfpbData.Type
