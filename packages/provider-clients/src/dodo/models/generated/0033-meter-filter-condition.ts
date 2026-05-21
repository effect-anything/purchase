import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterFilterCondition = Schema.Struct({
  key: Schema.String,
  operator: Schema.suspend(
    (): Schema.Schema<Models.FilterOperator, any, any> =>
      Models.FilterOperator as Schema.Schema<Models.FilterOperator, any, any>
  ),
  value: Schema.suspend(
    (): Schema.Schema<Models.FlexibleValue, any, any> =>
      Models.FlexibleValue as Schema.Schema<Models.FlexibleValue, any, any>
  )
})
export type MeterFilterCondition = typeof MeterFilterCondition.Type
