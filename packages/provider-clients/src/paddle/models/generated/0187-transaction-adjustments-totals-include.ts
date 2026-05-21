import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionAdjustmentsTotalsInclude = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  fee: Schema.String,
  retained_fee: Schema.String,
  earnings: Schema.String,
  breakdown: Schema.suspend(
    (): Schema.Schema<Models.TransactionAdjustmentsTotalsIncludeBreakdown, any, any> =>
      Models.TransactionAdjustmentsTotalsIncludeBreakdown as Schema.Schema<
        Models.TransactionAdjustmentsTotalsIncludeBreakdown,
        any,
        any
      >
  ),
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  )
})
export type TransactionAdjustmentsTotalsInclude = typeof TransactionAdjustmentsTotalsInclude.Type
