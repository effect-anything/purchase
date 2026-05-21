import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditBalance = Schema.Struct({
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode),
  balance: Schema.suspend((): Schema.Schema<Models.CustomerBalance> => Models.CustomerBalance)
})
export type CreditBalance = typeof CreditBalance.Type
