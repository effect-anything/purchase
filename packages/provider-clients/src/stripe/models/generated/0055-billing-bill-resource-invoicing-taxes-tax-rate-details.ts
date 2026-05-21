import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingTaxesTaxRateDetails = Schema.Struct({
  tax_rate: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
    )
  )
})
export type BillingBillResourceInvoicingTaxesTaxRateDetails =
  typeof BillingBillResourceInvoicingTaxesTaxRateDetails.Type
