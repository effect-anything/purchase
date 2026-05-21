import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FilterOperator = Schema.Literal(
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equals",
  "less_than",
  "less_than_or_equals",
  "contains",
  "does_not_contain"
)
export type FilterOperator = typeof FilterOperator.Type
