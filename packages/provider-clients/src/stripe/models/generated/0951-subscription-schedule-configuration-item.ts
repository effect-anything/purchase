import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduleConfigurationItem = Schema.Struct({
  billing_thresholds: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionItemBillingThresholds, any, any> =>
        Models.SubscriptionItemBillingThresholds as Schema.Schema<Models.SubscriptionItemBillingThresholds, any, any>
    )
  ),
  discounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.StackableDiscountWithDiscountSettings, any, any> =>
        Models.StackableDiscountWithDiscountSettings as Schema.Schema<
          Models.StackableDiscountWithDiscountSettings,
          any,
          any
        >
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  plan: Schema.Union(
    Schema.String,
    Schema.suspend((): Schema.Schema<Models.Plan, any, any> => Models.Plan as Schema.Schema<Models.Plan, any, any>),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedPlan, any, any> =>
        Models.DeletedPlan as Schema.Schema<Models.DeletedPlan, any, any>
    )
  ),
  price: Schema.Union(
    Schema.String,
    Schema.suspend((): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedPrice, any, any> =>
        Models.DeletedPrice as Schema.Schema<Models.DeletedPrice, any, any>
    )
  ),
  quantity: Schema.optional(Schema.Number),
  tax_rates: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
        )
      )
    )
  )
})
export type SubscriptionScheduleConfigurationItem = typeof SubscriptionScheduleConfigurationItem.Type
