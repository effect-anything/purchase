import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingPricingPricingPriceDetails = Schema.Struct({
  price: Schema.Union(
    Schema.String,
    Schema.suspend((): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>)
  ),
  product: Schema.String
})
export type BillingBillResourceInvoicingPricingPricingPriceDetails =
  typeof BillingBillResourceInvoicingPricingPricingPriceDetails.Type
