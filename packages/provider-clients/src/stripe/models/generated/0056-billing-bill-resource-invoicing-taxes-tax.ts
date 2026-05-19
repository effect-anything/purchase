import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingTaxesTax = Schema.Struct({
  amount: Schema.Number,
  tax_behavior: Schema.Literal("exclusive", "inclusive"),
  tax_rate_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingTaxesTaxRateDetails => Models.BillingBillResourceInvoicingTaxesTaxRateDetails)),
  taxability_reason: Schema.Literal("customer_exempt", "not_available", "not_collecting", "not_subject_to_tax", "not_supported", "portion_product_exempt", "portion_reduced_rated", "portion_standard_rated", "product_exempt", "product_exempt_holiday", "proportionally_rated", "reduced_rated", "reverse_charge", "standard_rated", "taxable_basis_reduced", "zero_rated"),
  taxable_amount: Schema.NullOr(Schema.Number),
  type: Schema.Literal("tax_rate_details"),
})
export type BillingBillResourceInvoicingTaxesTax = typeof BillingBillResourceInvoicingTaxesTax.Type
