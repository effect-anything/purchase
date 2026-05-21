import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentType = Schema.Literal("full", "partial")
export type AdjustmentType = typeof AdjustmentType.Type
