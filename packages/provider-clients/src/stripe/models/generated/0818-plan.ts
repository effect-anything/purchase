import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Plan = Schema.Struct({
  active: Schema.Boolean,
  amount: Schema.NullOr(Schema.Number),
  amount_decimal: Schema.NullOr(Schema.String),
  billing_scheme: Schema.Literal("per_unit", "tiered"),
  created: Schema.Number,
  currency: Schema.String,
  id: Schema.String,
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.Number,
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  meter: Schema.NullOr(Schema.String),
  nickname: Schema.NullOr(Schema.String),
  object: Schema.Literal("plan"),
  product: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Product => Models.Product), Schema.suspend((): typeof Models.DeletedProduct => Models.DeletedProduct))),
  tiers: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.PlanTier => Models.PlanTier))),
  tiers_mode: Schema.NullOr(Schema.Literal("graduated", "volume")),
  transform_usage: Schema.NullOr(Schema.suspend((): typeof Models.TransformUsage => Models.TransformUsage)),
  trial_period_days: Schema.NullOr(Schema.Number),
  usage_type: Schema.Literal("licensed", "metered"),
})
export type Plan = typeof Plan.Type
