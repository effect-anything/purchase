import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FilterClause = Schema.Struct({
  property: Schema.String,
  operator: Schema.suspend((): typeof Models.FilterOperator => Models.FilterOperator),
  value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean),
})
export type FilterClause = typeof FilterClause.Type
