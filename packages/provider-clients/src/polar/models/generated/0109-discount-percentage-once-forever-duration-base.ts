import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountPercentageOnceForeverDurationBase = Schema.Struct({
  duration: Schema.suspend((): typeof Models.DiscountDuration => Models.DiscountDuration),
  type: Schema.suspend((): typeof Models.DiscountType => Models.DiscountType),
  basis_points: Schema.Number,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  name: Schema.String,
  code: Schema.NullOr(Schema.String),
  starts_at: Schema.NullOr(Schema.String),
  ends_at: Schema.NullOr(Schema.String),
  max_redemptions: Schema.NullOr(Schema.Number),
  redemptions_count: Schema.Number,
  organization_id: Schema.String,
})
export type DiscountPercentageOnceForeverDurationBase = typeof DiscountPercentageOnceForeverDurationBase.Type
