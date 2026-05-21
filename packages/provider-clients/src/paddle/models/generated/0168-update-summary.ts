import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UpdateSummary = Schema.Struct({
  credit: Schema.suspend((): Schema.Schema<Models.Money> => Models.Money),
  charge: Schema.suspend((): Schema.Schema<Models.Money> => Models.Money),
  result: Schema.suspend((): Schema.Schema<Models.UpdateSummaryResult> => Models.UpdateSummaryResult)
})
export type UpdateSummary = typeof UpdateSummary.Type
