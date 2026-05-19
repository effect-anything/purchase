import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Meter = Schema.Struct({
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  name: Schema.String,
  unit: Schema.suspend((): typeof Models.MeterUnit => Models.MeterUnit),
  custom_label: Schema.optional(Schema.NullOr(Schema.String)),
  custom_multiplier: Schema.optional(Schema.NullOr(Schema.Number)),
  filter: Schema.suspend((): typeof Models.Filter => Models.Filter),
  aggregation: Schema.Union(Schema.suspend((): typeof Models.CountAggregation => Models.CountAggregation), Schema.suspend((): typeof Models.PropertyAggregation => Models.PropertyAggregation), Schema.suspend((): typeof Models.UniqueAggregation => Models.UniqueAggregation)),
  organization_id: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
})
export type Meter = typeof Meter.Type
