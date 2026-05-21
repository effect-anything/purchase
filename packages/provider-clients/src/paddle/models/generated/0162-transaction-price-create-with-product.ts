import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPriceCreateWithProduct = Schema.Struct({
  description: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_cycle: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.Duration, any, any> => Models.Duration as Schema.Schema<Models.Duration, any, any>
      )
    )
  ),
  trial_period: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.Duration, any, any> => Models.Duration as Schema.Schema<Models.Duration, any, any>
      )
    )
  ),
  tax_mode: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TaxMode, any, any> => Models.TaxMode as Schema.Schema<Models.TaxMode, any, any>
    )
  ),
  unit_price: Schema.suspend(
    (): Schema.Schema<Models.Money, any, any> => Models.Money as Schema.Schema<Models.Money, any, any>
  ),
  unit_price_overrides: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.UnitPriceOverride, any, any> =>
          Models.UnitPriceOverride as Schema.Schema<Models.UnitPriceOverride, any, any>
      )
    )
  ),
  quantity: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PriceQuantity, any, any> =>
        Models.PriceQuantity as Schema.Schema<Models.PriceQuantity, any, any>
    )
  ),
  custom_data: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.CustomData, any, any> =>
          Models.CustomData as Schema.Schema<Models.CustomData, any, any>
      )
    )
  ),
  product: Schema.suspend(
    (): Schema.Schema<Models.TransactionSubscriptionProductCreate, any, any> =>
      Models.TransactionSubscriptionProductCreate as Schema.Schema<
        Models.TransactionSubscriptionProductCreate,
        any,
        any
      >
  )
})
export type TransactionPriceCreateWithProduct = typeof TransactionPriceCreateWithProduct.Type
