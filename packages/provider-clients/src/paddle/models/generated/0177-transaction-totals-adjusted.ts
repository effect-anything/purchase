import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionTotalsAdjusted = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  grand_total: Schema.String,
  grand_total_tax: Schema.String,
  fee: Schema.NullOr(Schema.String),
  retained_fee: Schema.String,
  earnings: Schema.NullOr(Schema.String),
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  )
})
export type TransactionTotalsAdjusted = typeof TransactionTotalsAdjusted.Type
