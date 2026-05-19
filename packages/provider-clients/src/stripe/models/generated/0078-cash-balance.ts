import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CashBalance = Schema.Struct({
  available: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Number })),
  customer: Schema.String,
  customer_account: Schema.NullOr(Schema.String),
  livemode: Schema.Boolean,
  object: Schema.Literal("cash_balance"),
  settings: Schema.suspend((): typeof Models.CustomerBalanceCustomerBalanceSettings => Models.CustomerBalanceCustomerBalanceSettings),
})
export type CashBalance = typeof CashBalance.Type
