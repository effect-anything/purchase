import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionItem = Schema.Struct({
  billing_thresholds: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionItemBillingThresholds => Models.SubscriptionItemBillingThresholds)),
  created: Schema.Number,
  current_period_end: Schema.Number,
  current_period_start: Schema.Number,
  discounts: Schema.Array(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Discount => Models.Discount))),
  id: Schema.String,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("subscription_item"),
  plan: Schema.suspend((): typeof Models.Plan => Models.Plan),
  price: Schema.suspend((): typeof Models.Price => Models.Price),
  quantity: Schema.optional(Schema.Number),
  subscription: Schema.String,
  tax_rates: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.TaxRate => Models.TaxRate))),
})
export type SubscriptionItem = typeof SubscriptionItem.Type
