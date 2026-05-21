import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PropertyAggregation = Schema.Struct({
  func: Schema.Literal("sum", "max", "min", "avg"),
  property: Schema.String
})
export type PropertyAggregation = typeof PropertyAggregation.Type
