import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterFilter = Schema.Struct({
  clauses: Schema.Array(Schema.suspend((): Schema.Schema<Models.MeterFilterCondition> => Models.MeterFilterCondition)),
  conjunction: Schema.suspend((): Schema.Schema<Models.Conjunction> => Models.Conjunction)
})
export type MeterFilter = typeof MeterFilter.Type
