import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PersonUsCfpbData = Schema.Struct({
  ethnicity_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PersonEthnicityDetails, any, any> =>
        Models.PersonEthnicityDetails as Schema.Schema<Models.PersonEthnicityDetails, any, any>
    )
  ),
  race_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PersonRaceDetails, any, any> =>
        Models.PersonRaceDetails as Schema.Schema<Models.PersonRaceDetails, any, any>
    )
  ),
  self_identified_gender: Schema.NullOr(Schema.String)
})
export type PersonUsCfpbData = typeof PersonUsCfpbData.Type
