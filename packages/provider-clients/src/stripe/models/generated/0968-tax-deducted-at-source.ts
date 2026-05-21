import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TaxDeductedAtSource = Schema.Struct({
  id: Schema.String,
  object: Schema.Literal("tax_deducted_at_source"),
  period_end: Schema.Number,
  period_start: Schema.Number,
  tax_deduction_account_number: Schema.String
})
export type TaxDeductedAtSource = typeof TaxDeductedAtSource.Type
