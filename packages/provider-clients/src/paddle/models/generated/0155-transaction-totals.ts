import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionTotals = Schema.Struct({
  subtotal: Schema.String,
  discount: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  credit: Schema.String,
  credit_to_balance: Schema.String,
  balance: Schema.String,
  grand_total: Schema.String,
  grand_total_tax: Schema.String,
  fee: Schema.NullOr(Schema.String),
  earnings: Schema.NullOr(Schema.String),
  currency_code: Schema.suspend(() => Models.CurrencyCode),
})
export type TransactionTotals = typeof TransactionTotals.Type
