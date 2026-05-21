import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FilterOperator = Schema.Literal("eq", "ne", "gt", "gte", "lt", "lte", "like", "not_like")
export type FilterOperator = typeof FilterOperator.Type
