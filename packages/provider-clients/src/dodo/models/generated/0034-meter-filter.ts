import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MeterFilter = Schema.Struct({
  clauses: Schema.Array(Schema.suspend(() => Models.MeterFilterCondition)),
  conjunction: Schema.suspend(() => Models.Conjunction),
})
export type MeterFilter = typeof MeterFilter.Type
