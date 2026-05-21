import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterAggregation = Schema.Struct({
  type: Schema.suspend((): Schema.Schema<Models.MeterAggregationType> => Models.MeterAggregationType),
  key: Schema.optional(Schema.NullOr(Schema.String))
})
export type MeterAggregation = typeof MeterAggregation.Type
