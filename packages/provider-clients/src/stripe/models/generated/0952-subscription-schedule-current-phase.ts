import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduleCurrentPhase = Schema.Struct({
  end_date: Schema.Number,
  start_date: Schema.Number
})
export type SubscriptionScheduleCurrentPhase = typeof SubscriptionScheduleCurrentPhase.Type
