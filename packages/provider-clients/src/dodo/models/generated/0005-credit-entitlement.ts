import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditEntitlement = Schema.Struct({
  id: Schema.String,
  business_id: Schema.String,
  created_at: Schema.String,
  name: Schema.String,
  overage_behavior: Schema.suspend(() => Models.CbbOverageBehavior),
  overage_enabled: Schema.Boolean,
  precision: Schema.Number,
  rollover_enabled: Schema.Boolean,
  unit: Schema.String,
  updated_at: Schema.String,
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  expires_after_days: Schema.optional(Schema.NullOr(Schema.Number)),
  max_rollover_count: Schema.optional(Schema.NullOr(Schema.Number)),
  overage_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  price_per_unit: Schema.optional(Schema.NullOr(Schema.String)),
  rollover_percentage: Schema.optional(Schema.NullOr(Schema.Number)),
  rollover_timeframe_count: Schema.optional(Schema.NullOr(Schema.Number)),
  rollover_timeframe_interval: Schema.optional(Schema.suspend(() => Models.TimeInterval)),
})
export type CreditEntitlement = typeof CreditEntitlement.Type
