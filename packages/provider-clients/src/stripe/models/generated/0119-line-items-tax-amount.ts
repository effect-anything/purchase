import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LineItemsTaxAmount = Schema.Struct({
  amount: Schema.Number,
  rate: Schema.suspend(
    (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
  ),
  taxability_reason: Schema.NullOr(
    Schema.Literal(
      "customer_exempt",
      "not_collecting",
      "not_subject_to_tax",
      "not_supported",
      "portion_product_exempt",
      "portion_reduced_rated",
      "portion_standard_rated",
      "product_exempt",
      "product_exempt_holiday",
      "proportionally_rated",
      "reduced_rated",
      "reverse_charge",
      "standard_rated",
      "taxable_basis_reduced",
      "zero_rated"
    )
  ),
  taxable_amount: Schema.NullOr(Schema.Number)
})
export type LineItemsTaxAmount = typeof LineItemsTaxAmount.Type
