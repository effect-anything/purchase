import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditBalance = Schema.Struct({
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  ),
  balance: Schema.suspend(
    (): Schema.Schema<Models.CustomerBalance, any, any> =>
      Models.CustomerBalance as Schema.Schema<Models.CustomerBalance, any, any>
  )
})
export type CreditBalance = typeof CreditBalance.Type
