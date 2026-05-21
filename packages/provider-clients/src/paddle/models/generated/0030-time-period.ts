import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TimePeriod = Schema.Struct({
  starts_at: Schema.suspend(
    (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
  ),
  ends_at: Schema.suspend(
    (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
  )
})
export type TimePeriod = typeof TimePeriod.Type
