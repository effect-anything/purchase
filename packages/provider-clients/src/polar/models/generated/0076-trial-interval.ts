import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TrialInterval = Schema.Literal("day", "week", "month", "year")
export type TrialInterval = typeof TrialInterval.Type
