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
  product: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedProduct, any, any> =>
          Models.DeletedProduct as Schema.Schema<Models.DeletedProduct, any, any>
      )
    )
  ),
  tiers: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PlanTier, any, any> => Models.PlanTier as Schema.Schema<Models.PlanTier, any, any>
      )
    )
  ),
  tiers_mode: Schema.NullOr(Schema.Literal("graduated", "volume")),
  transform_usage: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransformUsage, any, any> =>
        Models.TransformUsage as Schema.Schema<Models.TransformUsage, any, any>
    )
  ),
  trial_period_days: Schema.NullOr(Schema.Number),
  usage_type: Schema.Literal("licensed", "metered")
})
export type Plan = typeof Plan.Type
