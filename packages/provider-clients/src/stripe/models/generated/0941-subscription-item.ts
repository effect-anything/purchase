import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionItem = Schema.Struct({
  billing_thresholds: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionItemBillingThresholds, any, any> =>
        Models.SubscriptionItemBillingThresholds as Schema.Schema<Models.SubscriptionItemBillingThresholds, any, any>
    )
  ),
  created: Schema.Number,
  current_period_end: Schema.Number,
  current_period_start: Schema.Number,
  discounts: Schema.Array(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
      )
    )
  ),
  id: Schema.String,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("subscription_item"),
  plan: Schema.suspend((): Schema.Schema<Models.Plan, any, any> => Models.Plan as Schema.Schema<Models.Plan, any, any>),
  price: Schema.suspend(
    (): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>
  ),
  quantity: Schema.optional(Schema.Number),
  subscription: Schema.String,
  tax_rates: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
      )
    )
  )
})
export type SubscriptionItem = typeof SubscriptionItem.Type
