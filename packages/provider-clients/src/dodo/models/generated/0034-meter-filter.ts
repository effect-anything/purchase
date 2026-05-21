import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterFilter = Schema.Struct({
  clauses: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.MeterFilterCondition, any, any> =>
        Models.MeterFilterCondition as Schema.Schema<Models.MeterFilterCondition, any, any>
    )
  ),
  conjunction: Schema.suspend(
    (): Schema.Schema<Models.Conjunction, any, any> => Models.Conjunction as Schema.Schema<Models.Conjunction, any, any>
  )
})
export type MeterFilter = typeof MeterFilter.Type
