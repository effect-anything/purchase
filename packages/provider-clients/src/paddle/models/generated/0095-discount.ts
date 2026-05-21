import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Discount = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.DiscountId> => Models.DiscountId),
  status: Schema.suspend((): Schema.Schema<Models.DiscountStatus> => Models.DiscountStatus),
  description: Schema.String,
  enabled_for_checkout: Schema.Boolean,
  code: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.DiscountCode> => Models.DiscountCode)),
  type: Schema.suspend((): Schema.Schema<Models.DiscountType> => Models.DiscountType),
  mode: Schema.suspend((): Schema.Schema<Models.DiscountMode> => Models.DiscountMode),
  amount: Schema.String,
  currency_code: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode)),
  recur: Schema.Boolean,
  maximum_recurring_intervals: Schema.NullOr(Schema.Number),
  usage_limit: Schema.NullOr(Schema.Number),
  restrict_to: Schema.NullOr(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.DiscountRestrictTo> => Models.DiscountRestrictTo))
  ),
  expires_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  times_used: Schema.Number,
  discount_group_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.DiscountGroupId> => Models.DiscountGroupId)),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  import_meta: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ImportMeta> => Models.ImportMeta))
})
export type Discount = typeof Discount.Type
