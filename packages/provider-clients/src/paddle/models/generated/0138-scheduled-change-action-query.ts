import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ScheduledChangeActionQuery = Schema.Literal("cancel", "pause", "resume", "none")
export type ScheduledChangeActionQuery = typeof ScheduledChangeActionQuery.Type
