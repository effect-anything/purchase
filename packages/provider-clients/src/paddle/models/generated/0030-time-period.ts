import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TimePeriod = Schema.Struct({
  starts_at: Schema.suspend(() => Models.Timestamp),
  ends_at: Schema.suspend(() => Models.Timestamp),
})
export type TimePeriod = typeof TimePeriod.Type
