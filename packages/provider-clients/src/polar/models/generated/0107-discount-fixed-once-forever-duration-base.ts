import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountFixedOnceForeverDurationBase = Schema.Struct({
  duration: Schema.suspend((): typeof Models.DiscountDuration => Models.DiscountDuration),
  type: Schema.suspend((): typeof Models.DiscountType => Models.DiscountType),
  amount: Schema.Number,
  currency: Schema.String,
  amounts: Schema.Record({ key: Schema.String, value: Schema.Number }),
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
export type DiscountFixedOnceForeverDurationBase = typeof DiscountFixedOnceForeverDurationBase.Type
