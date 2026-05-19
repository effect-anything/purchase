import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Meter = Schema.Struct({
  id: Schema.String,
  aggregation: Schema.suspend(() => Models.MeterAggregation),
  business_id: Schema.String,
  created_at: Schema.String,
  event_name: Schema.String,
  measurement_unit: Schema.String,
  name: Schema.String,
  updated_at: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  filter: Schema.optional(Schema.suspend(() => Models.MeterFilter)),
})
export type Meter = typeof Meter.Type
