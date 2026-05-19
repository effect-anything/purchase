import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RadarReviewResourceSession = Schema.Struct({
  browser: Schema.NullOr(Schema.String),
  device: Schema.NullOr(Schema.String),
  platform: Schema.NullOr(Schema.String),
  version: Schema.NullOr(Schema.String),
})
export type RadarReviewResourceSession = typeof RadarReviewResourceSession.Type
