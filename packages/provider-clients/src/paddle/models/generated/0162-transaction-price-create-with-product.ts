import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPriceCreateWithProduct = Schema.Struct({
  description: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_cycle: Schema.optional(Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration))),
  trial_period: Schema.optional(Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration))),
  tax_mode: Schema.optional(Schema.suspend((): Schema.Schema<Models.TaxMode> => Models.TaxMode)),
  unit_price: Schema.suspend((): Schema.Schema<Models.Money> => Models.Money),
  unit_price_overrides: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.UnitPriceOverride> => Models.UnitPriceOverride))
  ),
  quantity: Schema.optional(Schema.suspend((): Schema.Schema<Models.PriceQuantity> => Models.PriceQuantity)),
  custom_data: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData))
  ),
  product: Schema.suspend(
    (): Schema.Schema<Models.TransactionSubscriptionProductCreate> => Models.TransactionSubscriptionProductCreate
  )
})
export type TransactionPriceCreateWithProduct = typeof TransactionPriceCreateWithProduct.Type
