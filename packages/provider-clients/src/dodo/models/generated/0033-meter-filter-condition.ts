import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MeterFilterCondition = Schema.Struct({
  key: Schema.String,
  operator: Schema.suspend(() => Models.FilterOperator),
  value: Schema.suspend(() => Models.FlexibleValue),
})
export type MeterFilterCondition = typeof MeterFilterCondition.Type
