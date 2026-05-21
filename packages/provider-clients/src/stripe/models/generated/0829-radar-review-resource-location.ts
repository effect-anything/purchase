import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const RadarReviewResourceLocation = Schema.Struct({
  city: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  latitude: Schema.NullOr(Schema.Number),
  longitude: Schema.NullOr(Schema.Number),
  region: Schema.NullOr(Schema.String)
})
export type RadarReviewResourceLocation = typeof RadarReviewResourceLocation.Type
