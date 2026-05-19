import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AdjustmentItemType = Schema.Literal("full", "partial", "tax", "proration")
export type AdjustmentItemType = typeof AdjustmentItemType.Type
