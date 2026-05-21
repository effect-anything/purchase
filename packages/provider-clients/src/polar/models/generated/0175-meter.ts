import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Meter = Schema.Struct({
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  name: Schema.String,
  unit: Schema.suspend(
    (): Schema.Schema<Models.MeterUnit, any, any> => Models.MeterUnit as Schema.Schema<Models.MeterUnit, any, any>
  ),
  custom_label: Schema.optional(Schema.NullOr(Schema.String)),
  custom_multiplier: Schema.optional(Schema.NullOr(Schema.Number)),
  filter: Schema.suspend(
    (): Schema.Schema<Models.Filter, any, any> => Models.Filter as Schema.Schema<Models.Filter, any, any>
  ),
  aggregation: Schema.Union(
    Schema.suspend(
      (): Schema.Schema<Models.CountAggregation, any, any> =>
        Models.CountAggregation as Schema.Schema<Models.CountAggregation, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.PropertyAggregation, any, any> =>
        Models.PropertyAggregation as Schema.Schema<Models.PropertyAggregation, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.UniqueAggregation, any, any> =>
        Models.UniqueAggregation as Schema.Schema<Models.UniqueAggregation, any, any>
    )
  ),
  organization_id: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String))
})
export type Meter = typeof Meter.Type
