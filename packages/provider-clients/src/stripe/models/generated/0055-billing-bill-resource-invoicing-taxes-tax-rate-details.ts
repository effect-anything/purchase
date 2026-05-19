import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingTaxesTaxRateDetails = Schema.Struct({
  tax_rate: Schema.Union(Schema.String, Schema.suspend((): typeof Models.TaxRate => Models.TaxRate)),
})
export type BillingBillResourceInvoicingTaxesTaxRateDetails = typeof BillingBillResourceInvoicingTaxesTaxRateDetails.Type
