import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPriceCreateWithProduct = Schema.Struct({
  description: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  billing_cycle: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.Duration))),
  trial_period: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.Duration))),
  tax_mode: Schema.optional(Schema.suspend(() => Models.TaxMode)),
  unit_price: Schema.suspend(() => Models.Money),
  unit_price_overrides: Schema.optional(Schema.Array(Schema.suspend(() => Models.UnitPriceOverride))),
  quantity: Schema.optional(Schema.suspend(() => Models.PriceQuantity)),
  custom_data: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.CustomData))),
  product: Schema.suspend(() => Models.TransactionSubscriptionProductCreate),
})
export type TransactionPriceCreateWithProduct = typeof TransactionPriceCreateWithProduct.Type
