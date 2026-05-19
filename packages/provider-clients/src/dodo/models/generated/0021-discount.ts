import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Discount = Schema.Struct({
  amount: Schema.Number,
  business_id: Schema.String,
  code: Schema.String,
  created_at: Schema.String,
  discount_id: Schema.String,
  metadata: Schema.suspend(() => Models.Metadata),
  preserve_on_plan_change: Schema.Boolean,
  restricted_to: Schema.Array(Schema.String),
  times_used: Schema.Number,
  type: Schema.suspend(() => Models.DiscountType),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  subscription_cycles: Schema.optional(Schema.NullOr(Schema.Number)),
  usage_limit: Schema.optional(Schema.NullOr(Schema.Number)),
})
export type Discount = typeof Discount.Type
