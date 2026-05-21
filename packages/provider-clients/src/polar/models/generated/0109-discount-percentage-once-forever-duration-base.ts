import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountPercentageOnceForeverDurationBase = Schema.Struct({
  duration: Schema.suspend(
    (): Schema.Schema<Models.DiscountDuration, any, any> =>
      Models.DiscountDuration as Schema.Schema<Models.DiscountDuration, any, any>
  ),
  type: Schema.suspend(
    (): Schema.Schema<Models.DiscountType, any, any> =>
      Models.DiscountType as Schema.Schema<Models.DiscountType, any, any>
  ),
  basis_points: Schema.Number,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  name: Schema.String,
  code: Schema.NullOr(Schema.String),
  starts_at: Schema.NullOr(Schema.String),
  ends_at: Schema.NullOr(Schema.String),
  max_redemptions: Schema.NullOr(Schema.Number),
  redemptions_count: Schema.Number,
  organization_id: Schema.String
})
export type DiscountPercentageOnceForeverDurationBase = typeof DiscountPercentageOnceForeverDurationBase.Type
