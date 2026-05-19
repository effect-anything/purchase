import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Coupon = Schema.Struct({
  amount_off: Schema.NullOr(Schema.Number),
  applies_to: Schema.optional(Schema.suspend((): typeof Models.CouponAppliesTo => Models.CouponAppliesTo)),
  created: Schema.Number,
  currency: Schema.NullOr(Schema.String),
  currency_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.suspend((): typeof Models.CouponCurrencyOption => Models.CouponCurrencyOption) })),
  duration: Schema.Literal("forever", "once", "repeating"),
  duration_in_months: Schema.NullOr(Schema.Number),
  id: Schema.String,
  livemode: Schema.Boolean,
  max_redemptions: Schema.NullOr(Schema.Number),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("coupon"),
  percent_off: Schema.NullOr(Schema.Number),
  redeem_by: Schema.NullOr(Schema.Number),
  times_redeemed: Schema.Number,
  valid: Schema.Boolean,
})
export type Coupon = typeof Coupon.Type
