import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CountAggregation = Schema.Struct({
  func: Schema.optional(Schema.String)
})
export type CountAggregation = typeof CountAggregation.Type
