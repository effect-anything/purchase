import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentTaxRatesUsed = Schema.Struct({
  tax_rate: Schema.String,
  totals: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentTaxRatesUsedItemTotals, any, any> =>
      Models.AdjustmentTaxRatesUsedItemTotals as Schema.Schema<Models.AdjustmentTaxRatesUsedItemTotals, any, any>
  )
})
export type AdjustmentTaxRatesUsed = typeof AdjustmentTaxRatesUsed.Type
