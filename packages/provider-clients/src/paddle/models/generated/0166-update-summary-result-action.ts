import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UpdateSummaryResultAction = Schema.Literal("credit", "charge")
export type UpdateSummaryResultAction = typeof UpdateSummaryResultAction.Type
