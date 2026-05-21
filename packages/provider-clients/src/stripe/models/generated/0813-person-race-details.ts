import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PersonRaceDetails = Schema.Struct({
  race: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "african_american",
        "american_indian_or_alaska_native",
        "asian",
        "asian_indian",
        "black_or_african_american",
        "chinese",
        "ethiopian",
        "filipino",
        "guamanian_or_chamorro",
        "haitian",
        "jamaican",
        "japanese",
        "korean",
        "native_hawaiian",
        "native_hawaiian_or_other_pacific_islander",
        "nigerian",
        "other_asian",
        "other_black_or_african_american",
        "other_pacific_islander",
        "prefer_not_to_answer",
        "samoan",
        "somali",
        "vietnamese",
        "white"
      )
    )
  ),
  race_other: Schema.NullOr(Schema.String)
})
export type PersonRaceDetails = typeof PersonRaceDetails.Type
