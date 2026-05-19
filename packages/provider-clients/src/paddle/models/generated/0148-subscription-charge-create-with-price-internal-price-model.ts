import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionChargeCreateWithPriceInternalPriceModel = Schema.Struct({
  product_id: Schema.suspend(() => Models.ProductId),
  description: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  tax_mode: Schema.optional(Schema.suspend(() => Models.TaxMode)),
  unit_price: Schema.suspend(() => Models.Money),
  unit_price_overrides: Schema.optional(Schema.Array(Schema.suspend(() => Models.UnitPriceOverride))),
  quantity: Schema.optional(Schema.suspend(() => Models.PriceQuantity)),
  custom_data: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.CustomData))),
})
export type SubscriptionChargeCreateWithPriceInternalPriceModel = typeof SubscriptionChargeCreateWithPriceInternalPriceModel.Type
