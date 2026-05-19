import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegacyRecurringProductPriceFixed = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  source: Schema.suspend((): typeof Models.ProductPriceSource => Models.ProductPriceSource),
  amount_type: Schema.String,
  price_currency: Schema.String,
  tax_behavior: Schema.NullOr(Schema.suspend((): typeof Models.TaxBehaviorOption => Models.TaxBehaviorOption)),
  is_archived: Schema.Boolean,
  product_id: Schema.String,
  type: Schema.String,
  recurring_interval: Schema.suspend((): typeof Models.SubscriptionRecurringInterval => Models.SubscriptionRecurringInterval),
  price_amount: Schema.Number,
  legacy: Schema.Boolean,
})
export type LegacyRecurringProductPriceFixed = typeof LegacyRecurringProductPriceFixed.Type
