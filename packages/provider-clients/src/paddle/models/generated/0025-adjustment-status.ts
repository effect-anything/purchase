import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentStatus = Schema.Literal("pending_approval", "approved", "rejected", "reversed")
export type AdjustmentStatus = typeof AdjustmentStatus.Type
