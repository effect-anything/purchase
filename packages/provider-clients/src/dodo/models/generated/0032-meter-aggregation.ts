import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterAggregation = Schema.Struct({
  type: Schema.suspend(
    (): Schema.Schema<Models.MeterAggregationType, any, any> =>
      Models.MeterAggregationType as Schema.Schema<Models.MeterAggregationType, any, any>
  ),
  key: Schema.optional(Schema.NullOr(Schema.String))
})
export type MeterAggregation = typeof MeterAggregation.Type
