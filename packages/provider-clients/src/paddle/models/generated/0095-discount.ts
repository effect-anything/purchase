import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Discount = Schema.Struct({
  id: Schema.suspend(() => Models.DiscountId),
  status: Schema.suspend(() => Models.DiscountStatus),
  description: Schema.String,
  enabled_for_checkout: Schema.Boolean,
  code: Schema.NullOr(Schema.suspend(() => Models.DiscountCode)),
  type: Schema.suspend(() => Models.DiscountType),
  mode: Schema.suspend(() => Models.DiscountMode),
  amount: Schema.String,
  currency_code: Schema.NullOr(Schema.suspend(() => Models.CurrencyCode)),
  recur: Schema.Boolean,
  maximum_recurring_intervals: Schema.NullOr(Schema.Number),
  usage_limit: Schema.NullOr(Schema.Number),
  restrict_to: Schema.NullOr(Schema.Array(Schema.suspend(() => Models.DiscountRestrictTo))),
  expires_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  times_used: Schema.Number,
  discount_group_id: Schema.NullOr(Schema.suspend(() => Models.DiscountGroupId)),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMeta)),
})
export type Discount = typeof Discount.Type
