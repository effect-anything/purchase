import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TimePeriod = Schema.Struct({
  starts_at: Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp),
  ends_at: Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)
})
export type TimePeriod = typeof TimePeriod.Type
