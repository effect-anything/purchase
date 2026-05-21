import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Discount = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.DiscountId, any, any> => Models.DiscountId as Schema.Schema<Models.DiscountId, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.DiscountStatus, any, any> =>
      Models.DiscountStatus as Schema.Schema<Models.DiscountStatus, any, any>
  ),
  description: Schema.String,
  enabled_for_checkout: Schema.Boolean,
  code: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountCode, any, any> =>
        Models.DiscountCode as Schema.Schema<Models.DiscountCode, any, any>
    )
  ),
  type: Schema.suspend(
    (): Schema.Schema<Models.DiscountType, any, any> =>
      Models.DiscountType as Schema.Schema<Models.DiscountType, any, any>
  ),
  mode: Schema.suspend(
    (): Schema.Schema<Models.DiscountMode, any, any> =>
      Models.DiscountMode as Schema.Schema<Models.DiscountMode, any, any>
  ),
  amount: Schema.String,
  currency_code: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CurrencyCode, any, any> =>
        Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
    )
  ),
  recur: Schema.Boolean,
  maximum_recurring_intervals: Schema.NullOr(Schema.Number),
  usage_limit: Schema.NullOr(Schema.Number),
  restrict_to: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.DiscountRestrictTo, any, any> =>
          Models.DiscountRestrictTo as Schema.Schema<Models.DiscountRestrictTo, any, any>
      )
    )
  ),
  expires_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  times_used: Schema.Number,
  discount_group_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountGroupId, any, any> =>
        Models.DiscountGroupId as Schema.Schema<Models.DiscountGroupId, any, any>
    )
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMeta, any, any> => Models.ImportMeta as Schema.Schema<Models.ImportMeta, any, any>
    )
  )
})
export type Discount = typeof Discount.Type
