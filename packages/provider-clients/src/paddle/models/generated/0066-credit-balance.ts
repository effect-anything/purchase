import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditBalance = Schema.Struct({
  customer_id: Schema.suspend(() => Models.CustomerId),
  currency_code: Schema.suspend(() => Models.CurrencyCode),
  balance: Schema.suspend(() => Models.CustomerBalance),
})
export type CreditBalance = typeof CreditBalance.Type
