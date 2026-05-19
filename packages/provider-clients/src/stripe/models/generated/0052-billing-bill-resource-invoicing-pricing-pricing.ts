import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingPricingPricing = Schema.Struct({
  price_details: Schema.optional(Schema.suspend((): typeof Models.BillingBillResourceInvoicingPricingPricingPriceDetails => Models.BillingBillResourceInvoicingPricingPricingPriceDetails)),
  type: Schema.Literal("price_details"),
  unit_amount_decimal: Schema.NullOr(Schema.String),
})
export type BillingBillResourceInvoicingPricingPricing = typeof BillingBillResourceInvoicingPricingPricing.Type
