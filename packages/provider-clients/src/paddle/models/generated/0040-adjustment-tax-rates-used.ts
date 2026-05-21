import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentTaxRatesUsed = Schema.Struct({
  tax_rate: Schema.String,
  totals: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentTaxRatesUsedItemTotals> => Models.AdjustmentTaxRatesUsedItemTotals
  )
})
export type AdjustmentTaxRatesUsed = typeof AdjustmentTaxRatesUsed.Type
