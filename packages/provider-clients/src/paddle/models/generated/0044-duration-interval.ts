import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DurationInterval = Schema.Literal("day", "week", "month", "year")
export type DurationInterval = typeof DurationInterval.Type
