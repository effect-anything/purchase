import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Meter = Schema.Struct({
  id: Schema.String,
  aggregation: Schema.suspend(
    (): Schema.Schema<Models.MeterAggregation, any, any> =>
      Models.MeterAggregation as Schema.Schema<Models.MeterAggregation, any, any>
  ),
  business_id: Schema.String,
  created_at: Schema.String,
  event_name: Schema.String,
  measurement_unit: Schema.String,
  name: Schema.String,
  updated_at: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  filter: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MeterFilter, any, any> =>
        Models.MeterFilter as Schema.Schema<Models.MeterFilter, any, any>
    )
  )
})
export type Meter = typeof Meter.Type
