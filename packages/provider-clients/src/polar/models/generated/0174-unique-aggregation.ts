import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const UniqueAggregation = Schema.Struct({
  func: Schema.optional(Schema.String),
  property: Schema.String,
})
export type UniqueAggregation = typeof UniqueAggregation.Type
