import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UpdateSummary = Schema.Struct({
  credit: Schema.suspend(
    (): Schema.Schema<Models.Money, any, any> => Models.Money as Schema.Schema<Models.Money, any, any>
  ),
  charge: Schema.suspend(
    (): Schema.Schema<Models.Money, any, any> => Models.Money as Schema.Schema<Models.Money, any, any>
  ),
  result: Schema.suspend(
    (): Schema.Schema<Models.UpdateSummaryResult, any, any> =>
      Models.UpdateSummaryResult as Schema.Schema<Models.UpdateSummaryResult, any, any>
  )
})
export type UpdateSummary = typeof UpdateSummary.Type
