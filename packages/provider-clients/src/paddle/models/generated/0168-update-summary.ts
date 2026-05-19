import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const UpdateSummary = Schema.Struct({
  credit: Schema.suspend(() => Models.Money),
  charge: Schema.suspend(() => Models.Money),
  result: Schema.suspend(() => Models.UpdateSummaryResult),
})
export type UpdateSummary = typeof UpdateSummary.Type
