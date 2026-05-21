import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Recurring = Schema.Struct({
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.Number,
  meter: Schema.NullOr(Schema.String),
  trial_period_days: Schema.NullOr(Schema.Number),
  usage_type: Schema.Literal("licensed", "metered")
})
export type Recurring = typeof Recurring.Type
