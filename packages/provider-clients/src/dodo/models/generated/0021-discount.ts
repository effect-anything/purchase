import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Discount = Schema.Struct({
  amount: Schema.Number,
  business_id: Schema.String,
  code: Schema.String,
  created_at: Schema.String,
  discount_id: Schema.String,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.Metadata, any, any> => Models.Metadata as Schema.Schema<Models.Metadata, any, any>
  ),
  preserve_on_plan_change: Schema.Boolean,
  restricted_to: Schema.Array(Schema.String),
  times_used: Schema.Number,
  type: Schema.suspend(
    (): Schema.Schema<Models.DiscountType, any, any> =>
      Models.DiscountType as Schema.Schema<Models.DiscountType, any, any>
  ),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  subscription_cycles: Schema.optional(Schema.NullOr(Schema.Number)),
  usage_limit: Schema.optional(Schema.NullOr(Schema.Number))
})
export type Discount = typeof Discount.Type
