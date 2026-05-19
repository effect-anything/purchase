import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RadarRadarOptions = Schema.Struct({
  session: Schema.optional(Schema.String),
})
export type RadarRadarOptions = typeof RadarRadarOptions.Type
