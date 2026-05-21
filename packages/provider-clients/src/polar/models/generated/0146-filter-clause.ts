import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FilterClause = Schema.Struct({
  property: Schema.String,
  operator: Schema.suspend(
    (): Schema.Schema<Models.FilterOperator, any, any> =>
      Models.FilterOperator as Schema.Schema<Models.FilterOperator, any, any>
  ),
  value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean)
})
export type FilterClause = typeof FilterClause.Type
