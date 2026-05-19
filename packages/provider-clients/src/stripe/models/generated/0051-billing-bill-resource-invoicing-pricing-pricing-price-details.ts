import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingPricingPricingPriceDetails = Schema.Struct({
  price: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Price => Models.Price)),
  product: Schema.String,
})
export type BillingBillResourceInvoicingPricingPricingPriceDetails = typeof BillingBillResourceInvoicingPricingPricingPriceDetails.Type
