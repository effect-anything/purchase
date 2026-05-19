import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TimeInterval = Schema.Literal("day", "week", "month", "year")
export type TimeInterval = typeof TimeInterval.Type
