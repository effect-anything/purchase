import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Price = Schema.Struct({
  active: Schema.Boolean,
  billing_scheme: Schema.Literal("per_unit", "tiered"),
  created: Schema.Number,
  currency: Schema.String,
  currency_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.suspend((): typeof Models.CurrencyOption => Models.CurrencyOption) })),
  custom_unit_amount: Schema.NullOr(Schema.suspend((): typeof Models.CustomUnitAmount => Models.CustomUnitAmount)),
  id: Schema.String,
  livemode: Schema.Boolean,
  lookup_key: Schema.NullOr(Schema.String),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  nickname: Schema.NullOr(Schema.String),
  object: Schema.Literal("price"),
  product: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Product => Models.Product), Schema.suspend((): typeof Models.DeletedProduct => Models.DeletedProduct)),
  recurring: Schema.NullOr(Schema.suspend((): typeof Models.Recurring => Models.Recurring)),
  tax_behavior: Schema.NullOr(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tiers: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.PriceTier => Models.PriceTier))),
  tiers_mode: Schema.NullOr(Schema.Literal("graduated", "volume")),
  transform_quantity: Schema.NullOr(Schema.suspend((): typeof Models.TransformQuantity => Models.TransformQuantity)),
  type: Schema.Literal("one_time", "recurring"),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String),
})
export type Price = typeof Price.Type
