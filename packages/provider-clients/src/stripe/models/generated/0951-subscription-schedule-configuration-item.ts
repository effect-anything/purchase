import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionScheduleConfigurationItem = Schema.Struct({
  billing_thresholds: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionItemBillingThresholds => Models.SubscriptionItemBillingThresholds)),
  discounts: Schema.Array(Schema.suspend((): typeof Models.StackableDiscountWithDiscountSettings => Models.StackableDiscountWithDiscountSettings)),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  plan: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Plan => Models.Plan), Schema.suspend((): typeof Models.DeletedPlan => Models.DeletedPlan)),
  price: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Price => Models.Price), Schema.suspend((): typeof Models.DeletedPrice => Models.DeletedPrice)),
  quantity: Schema.optional(Schema.Number),
  tax_rates: Schema.optional(Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.TaxRate => Models.TaxRate)))),
})
export type SubscriptionScheduleConfigurationItem = typeof SubscriptionScheduleConfigurationItem.Type
